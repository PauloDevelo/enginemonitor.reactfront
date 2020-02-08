import * as log from 'loglevel';
import httpProxy from './HttpProxy';
import HttpError from '../http/HttpError';
import syncService from './SyncService';

import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { UserModel, AuthInfo } from '../types/Types';
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

    /**
     * This function tries to get a user stored in the global storage due to the remember me feature.
     * If it can read a user, it will set the token for the http authentication, it will open the user storage, and it will signal a user has been set thanks to the user context.
     */
    tryGetAndSetMemorizedUser():Promise<UserModel | undefined>;
}

class UserProxy implements IUserProxy {
    baseUrl = `${process.env.REACT_APP_URL_BASE}users/`;

    // ///////////////////User/////////////////////////
    signup = async (newUser: UserModel): Promise<void> => {
      await httpProxy.post(this.baseUrl, { user: newUser });
    }

    sendVerificationEmail = async (email: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}verificationemail`, { email });
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}resetpassword`, { email, newPassword: password });
    }

    authenticate = async (authInfo: AuthInfo):Promise<UserModel> => {
      this.logout();

      const { user }: { user: UserModel | undefined } = await httpProxy.post(`${this.baseUrl}login`, { user: authInfo });

      if (user) {
        this.setHttpProxyAuthentication(user);

        if (authInfo.remember) {
          storageService.setGlobalItem('currentUser', user);
        }

        await storageService.openUserStorage(user);
        await userContext.onUserChanged(user);

        return user;
      }

      throw new HttpError({ loginerror: 'loginfailed' });
    }

    logout = async (): Promise<void> => {
      await storageService.removeGlobalItem('currentUser');
      httpProxy.setConfig(undefined);
      await storageService.closeUserStorage();
      await userContext.onUserChanged(undefined);
    }

    tryGetAndSetMemorizedUser = async ():Promise<UserModel | undefined> => {
      if (await storageService.existGlobalItem('currentUser')) {
        let rememberedUser = await storageService.getGlobalItem<UserModel>('currentUser');
        this.setHttpProxyAuthentication(rememberedUser);

        if (await syncService.isOnline()) {
          try {
            const { user: currentUser }:{ user:UserModel | undefined } = await httpProxy.get(`${this.baseUrl}current`);
            if (currentUser) {
              storageService.setGlobalItem('currentUser', currentUser);
              this.setHttpProxyAuthentication(currentUser);
              rememberedUser = currentUser;
            }
          } catch (error) {
            log.error(error.message);
          }
        }

        await storageService.openUserStorage(rememberedUser);
        await userContext.onUserChanged(rememberedUser);
        return rememberedUser;
      }

      return undefined;
    }

    setHttpProxyAuthentication = ({ token }: UserModel) => {
      const config:Config = { headers: { Authorization: `Token ${token}` } };
      httpProxy.setConfig(config);
    }
}

const userProxy:IUserProxy = new UserProxy();
export default userProxy;
