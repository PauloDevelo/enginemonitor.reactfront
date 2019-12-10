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
    baseUrl = process.env.REACT_APP_URL_BASE;

    // ///////////////////User/////////////////////////
    signup = async (newUser: UserModel): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}users/`, { user: newUser });
    }

    sendVerificationEmail = async (email: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}users/verificationemail`, { email });
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
      await httpProxy.post(`${this.baseUrl}users/resetpassword`, { email, newPassword: password });
    }

    authenticate = async (authInfo: AuthInfo):Promise<UserModel> => {
      this.logout();

      const { user }: { user: UserModel | undefined } = await httpProxy.post(`${this.baseUrl}users/login`, { user: authInfo });

      if (user) {
        this.setHttpProxyAuthentication(user);

        if (authInfo.remember) {
          storageService.setGlobalItem('currentUser', user);
        }

        await storageService.openUserStorage(user);
        userContext.onUserChanged(user);

        return user;
      }

      throw new HttpError({ loginerror: 'loginfailed' });
    }

    logout = async (): Promise<void> => {
      storageService.removeGlobalItem('currentUser');
      httpProxy.setConfig(undefined);
      storageService.closeUserStorage();
      userContext.onUserChanged(undefined);
    }

    tryGetAndSetMemorizedUser = async ():Promise<UserModel | undefined> => {
      try {
        const rememberedUser = await storageService.getGlobalItem<UserModel>('currentUser');
        this.setHttpProxyAuthentication(rememberedUser);

        if (await syncService.isOnline()) {
          const { user: currentUser }:{ user:UserModel | undefined } = await httpProxy.get(`${this.baseUrl}users/current`);
          if (currentUser) {
            storageService.setGlobalItem('currentUser', currentUser);
            this.setHttpProxyAuthentication(currentUser);
            await storageService.openUserStorage(currentUser);
            userContext.onUserChanged(currentUser);
            return currentUser;
          }
        }

        await storageService.openUserStorage(rememberedUser);
        userContext.onUserChanged(rememberedUser);
        return rememberedUser;
      } catch (reason) {
        await this.logout();

        return undefined;
      }
    }

    setHttpProxyAuthentication = ({ token }: UserModel) => {
      const config:Config = { headers: { Authorization: `Token ${token}` } };
      httpProxy.setConfig(config);
    }
}

const userProxy:IUserProxy = new UserProxy();
export default userProxy;
