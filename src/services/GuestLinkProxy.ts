import * as log from 'loglevel';
import uuidv1 from 'uuid/v1.js';

import httpProxy from './HttpProxy';
import progressiveHttpProxy from './ProgressiveHttpProxy';
import syncService from './SyncService';

import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { UserModel, GuestLinkModel } from '../types/Types';
import userContext from './UserContext';
import assetManager from './AssetManager';
import HttpError from '../http/HttpError';


type Config = {
    headers: {
        Authorization: string
    }
};

export interface IGuestLinkProxy{
    createGuestLink(assetUiId: string, nameGuestLink: string): Promise<GuestLinkModel>;

    getGuestLinks(assetUiId: string): Promise<GuestLinkModel[]>;

    removeGuestLink(guestLinkUiId: string, assetUiId: string): Promise<GuestLinkModel>;

    /**
     * This function tries to get a user from the back end using the niceKey .
     * If it can get a user, it will set the token for the http authentication, it will open the user storage, and it will signal a user has been set thanks to the user context.
     */
    tryGetAndSetUserFromNiceKey(niceKey: string):Promise<UserModel | undefined>;
}

class GuestLinkProxy implements IGuestLinkProxy {
    baseUrl = `${process.env.REACT_APP_API_URL_BASE}guestlinks/`;

    createGuestLink = async (assetUiId: string, nameGuestLink: string): Promise<GuestLinkModel> => {
      if (await syncService.isOnline() === false) {
        throw new HttpError('mustBeOnlineForSharedLinkCreation');
      }

      this.checkUserCredentialForPostingOrDeleting();

      const data = {
        guestLinkUiId: uuidv1(), guestUiId: uuidv1(), nameGuestLink, assetUiId,
      };
      const { guestlink } = await httpProxy.post(this.baseUrl, data);

      await storageService.updateArray(this.getGuestLinksUrl(assetUiId), guestlink);

      return guestlink;
    }

    getGuestLinks = async (assetUiId: string): Promise<GuestLinkModel[]> => progressiveHttpProxy.getArrayOnlineFirst(this.getGuestLinksUrl(assetUiId), 'guestlinks')

    removeGuestLink = async (guestLinkUiId: string, assetUiId: string): Promise<GuestLinkModel> => {
      if (await syncService.isOnline() === false) {
        throw new HttpError('mustBeOnlineForSharedLinkDeletion');
      }

      this.checkUserCredentialForPostingOrDeleting();

      const { guestlink }:{ guestlink:GuestLinkModel } = await httpProxy.deleteReq(`${this.baseUrl}${guestLinkUiId}`);
      await storageService.removeItemInArray(this.getGuestLinksUrl(assetUiId), guestlink._uiId);

      return guestlink;
    }

    tryGetAndSetUserFromNiceKey = async (niceKey: string):Promise<UserModel | undefined> => {
      if (await syncService.isOnline()) {
        try {
          const { user }:{ user:UserModel | undefined } = await httpProxy.get(`${this.baseUrl}nicekey/${niceKey}`);
          if (user) {
            this.setHttpProxyAuthentication(user);

            await storageService.openUserStorage(user);
            await userContext.onUserChanged(user);
            return user;
          }
        } catch (error) {
          log.error(error.message);
        }
      } else {
        log.error('Impossible to connect on the back end.');
      }

      return undefined;
    }

    private getGuestLinksUrl = (assetUiId: string) => `${this.baseUrl}asset/${assetUiId}`;

    private checkUserCredentialForPostingOrDeleting = () => {
      if (assetManager.getUserCredentials()?.readonly) {
        throw new HttpError({ message: 'credentialError' });
      }
    }

    private setHttpProxyAuthentication = ({ token }: UserModel) => {
      const config:Config = { headers: { Authorization: `Token ${token}` } };
      httpProxy.setConfig(config);
    }
}

const guestLinkProxy:IGuestLinkProxy = new GuestLinkProxy();
export default guestLinkProxy;
