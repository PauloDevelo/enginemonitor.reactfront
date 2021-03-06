import * as log from 'loglevel';
import Cookies from 'js-cookie';
import _ from 'lodash';

import httpProxy from './HttpProxy';
import progressiveHttpProxy from './ProgressiveHttpProxy';
import HttpError from '../http/HttpError';
import onlineManager from './OnlineManager';
import analytics from '../helpers/AnalyticsHelper';

import storageService from './StorageService';

import {
  // eslint-disable-next-line no-unused-vars
  UserModel, AuthInfo, UserCredentials, extractUserModel,
} from '../types/Types';
import userContext from './UserContext';

type Config = {
    headers: {
        Authorization: string
    }
};

export interface IUserProxy{
    signup(newUser: UserModel): Promise<void>;
    sendVerificationEmail(email: string): Promise<void>;
    resetPassword(email: string, password: string): Promise<void>;
    authenticate (authInfo: AuthInfo):Promise<UserModel>;
    logout(): Promise<void>;
    getCredentials({ assetUiId }: {assetUiId: string}): Promise<UserCredentials>;
    deleteUser(): Promise<void>;

    /**
     * This function tries to get a user stored in the global storage due to the remember me feature.
     * If it can read a user, it will set the token for the http authentication, it will open the user storage, and it will signal a user has been set thanks to the user context.
     */
    tryGetAndSetMemorizedUser():Promise<UserModel | undefined>;
    tryGetAndSetMemorizedUserFromCookie(): Promise<boolean>;
}

class UserProxy implements IUserProxy {
    baseUrl = `${process.env.REACT_APP_API_URL_BASE}users/`;

    // ///////////////////User/////////////////////////
    signup = async (newUser: UserModel): Promise<void> => {
      await httpProxy.post(this.baseUrl, { user: newUser });

      analytics.sendEngagementEvent('sign_up');
    }

    sendVerificationEmail = async (email: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}verificationemail`, { email });

      analytics.sendEngagementEvent('send_verification_email');
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}resetpassword`, { email, newPassword: password });

      analytics.sendEngagementEvent('reset_password');
    }

    authenticate = async (authInfo: AuthInfo):Promise<UserModel> => {
      this.logout();

      const { user }: { user: UserModel | undefined } = await httpProxy.post(`${this.baseUrl}login`, { user: authInfo });

      if (user) {
        this.setHttpProxyAuthentication(user);

        if (authInfo.remember) {
          storageService.setGlobalItem('currentUser', extractUserModel(user));
        }

        storageService.openUserStorage(user);
        userContext.onUserChanged(user);

        analytics.sendEngagementEvent('login', { method: 'email_password' });

        return user;
      }

      throw new HttpError({ loginerror: 'loginfailed' });
    }

    deleteUser = async (): Promise<void> => {
      await progressiveHttpProxy.deleteOnlyOnline<UserModel>(this.baseUrl);

      await storageService.getUserStorage().clear();
      await storageService.removeGlobalItem('rememberMe');
      await storageService.removeGlobalItem('currentUser');
    }

    logout = async (): Promise<void> => {
      await storageService.setGlobalItem('currentUser', undefined);

      httpProxy.setConfig(undefined);
      await storageService.closeUserStorage();
      await userContext.onUserChanged(undefined);

      analytics.sendEngagementEvent('logout');
    }

    getCredentials = async ({ assetUiId }: {assetUiId: string}): Promise<UserCredentials> => progressiveHttpProxy.getOnlineFirst<UserCredentials>(`${this.baseUrl}credentials/${assetUiId}`, 'credentials')

    tryGetAndSetMemorizedUser = async ():Promise<UserModel | undefined> => {
      if (await storageService.existGlobalItem('currentUser')) {
        let rememberedUser = await storageService.getGlobalItem<UserModel>('currentUser');
        if (rememberedUser) {
          this.setHttpProxyAuthentication(rememberedUser);

          if (await onlineManager.isOnline()) {
            try {
              const response = await httpProxy.get(`${this.baseUrl}current`);
              const { user: currentUser }:{ user:UserModel | undefined } = response;
              if (currentUser) {
                storageService.setGlobalItem('currentUser', extractUserModel(currentUser));
                this.setHttpProxyAuthentication(currentUser);
                rememberedUser = currentUser;
              }
            } catch (error) {
              log.error(error.message);
              if (error instanceof HttpError) {
                const httpError = error as HttpError;
                const httpErrorCode = _.get(httpError, 'data.error.status');
                if (httpErrorCode === 401) {
                  await userContext.onUserChanged(undefined);
                  return undefined;
                }
              }
            }
          }

          await storageService.openUserStorage(rememberedUser);
          await userContext.onUserChanged(rememberedUser);

          analytics.sendEngagementEvent('login', { method: 'storage' });

          return rememberedUser;
        }
      }

      await userContext.onUserChanged(undefined);
      return undefined;
    }

    tryGetAndSetMemorizedUserFromCookie = async (): Promise<boolean> => {
      const authUser = Cookies.getJSON('authUser');

      if (!authUser) {
        return Promise.resolve(false);
      }

      const rememberMe = await storageService.getGlobalItem<boolean>('rememberMe');
      log.debug(rememberMe);
      Cookies.remove('authUser');

      this.setHttpProxyAuthentication(authUser);

      let currentUser = authUser;
      if (await onlineManager.isOnline()) {
        try {
          const { user: updatedUser }:{ user:UserModel | undefined } = await httpProxy.get(`${this.baseUrl}current`);
          if (updatedUser) {
            if (rememberMe) {
              storageService.setGlobalItem('currentUser', extractUserModel(updatedUser));
            }
            this.setHttpProxyAuthentication(updatedUser);

            currentUser = updatedUser;
          }
        } catch (error) {
          log.error(error.message);
        }
      }

      await storageService.openUserStorage(currentUser);
      await userContext.onUserChanged(currentUser);

      analytics.sendEngagementEvent('login', { method: 'cookie' });

      return Promise.resolve(true);
    }

    setHttpProxyAuthentication = ({ token }: UserModel) => {
      const config:Config = { headers: { Authorization: `Token ${token}` } };
      httpProxy.setConfig(config);
    }
}

const userProxy:IUserProxy = new UserProxy();
export default userProxy;
