import httpProxy from './HttpProxy';
import HttpError from '../http/HttpError'

import storageService from './StorageService';

import {UserModel, AuthInfo} from '../types/Types'
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
    fetchCurrentUser():Promise<UserModel | undefined>;
}

class UserProxy implements IUserProxy{
    baseUrl = process.env.REACT_APP_URL_BASE;

    /////////////////////User/////////////////////////
    signup = async (newUser: UserModel): Promise<void> => {
        await httpProxy.post(this.baseUrl + "users/", { user: newUser });
    }

    sendVerificationEmail = async(email: string): Promise<void> => {
        await httpProxy.post(this.baseUrl + "users/verificationemail", { email: email });
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
        await httpProxy.post(this.baseUrl + "users/resetpassword", { email: email, newPassword: password });
    }

    authenticate = async (authInfo: AuthInfo):Promise<UserModel> => {
        this.logout();

        const data = await httpProxy.post(this.baseUrl + "users/login", { user: authInfo });
        
        if(data.user){
            const user = data.user as UserModel;
            const config:Config = { headers: { Authorization: 'Token ' + data.user.token }};
            httpProxy.setConfig(config);

            if(authInfo.remember){
                storageService.setGlobalItem('EquipmentMonitorServiceProxy.config', config);
                storageService.setGlobalItem('currentUser', user);
            }

            await storageService.openUserStorage(user);
            userContext.onUserChanged(user);

            return user;
        }
        
        throw new HttpError( { loginerror: "loginfailed"} );
    }

    logout = async (): Promise<void> => {
        storageService.removeGlobalItem('EquipmentMonitorServiceProxy.config');
        storageService.removeGlobalItem('currentUser');
        httpProxy.setConfig(undefined);
        storageService.closeUserStorage();
        userContext.onUserChanged(undefined);
    }

    fetchCurrentUser = async():Promise<UserModel | undefined> => {
        const config = await storageService.getGlobalItem<Config>('EquipmentMonitorServiceProxy.config');
        httpProxy.setConfig(config);

        if(config){
            const user = await storageService.getGlobalItem<UserModel>('currentUser');
            if (user){
                await storageService.openUserStorage(user);
                userContext.onUserChanged(user);
                return user;
            }
        }
        
        userContext.onUserChanged(undefined);
        return undefined;
    }
}

const userProxy:IUserProxy = new UserProxy();
export default userProxy;