import * as log from 'loglevel';
import uuidv1 from 'uuid/v1.js';

import httpProxy from './HttpProxy';
import syncService from './SyncService';

import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { UserModel, GuestLink } from '../types/Types';
import userContext from './UserContext';


type Config = {
    headers: {
        Authorization: string
    }
};

export interface IGuestLinkProxy{
    /**
     * This function tries to get a user from the back end using the niceKey .
     * If it can get a user, it will set the token for the http authentication, it will open the user storage, and it will signal a user has been set thanks to the user context.
     */
    tryGetAndSetUserFromNiceKey(niceKey: string):Promise<UserModel | undefined>;

    createGuestLink(assetUiId: string, nameGuestLink: string): Promise<GuestLink>;

    getGuestLinks(assetUiId: string): Promise<GuestLink[]>;

    removeGuestLink(guestLinkUiId: string): Promise<GuestLink>;
}

class GuestLinkProxy implements IGuestLinkProxy {
    baseUrl = `${process.env.REACT_APP_API_URL_BASE}guestlinks/`;

    createGuestLink = async (assetUiId: string, nameGuestLink: string): Promise<GuestLink> => {
      if (syncService.isOnline() === false) {
        throw new Error('You must be online to get shared links');
      }

      const data = {
        guestLinkUiId: uuidv1(), guestUiId: uuidv1(), nameGuestLink, assetUiId,
      };
      const { guestlink } = await httpProxy.post(this.baseUrl, data);

      return guestlink;
    }

    getGuestLinks = async (assetUiId: string): Promise<GuestLink[]> => {
      if (syncService.isOnline() === false) {
        throw new Error('You must be online to get shared links');
      }

      const { guestlinks }:{ guestlinks:GuestLink[] } = await httpProxy.get(`${this.baseUrl}asset/${assetUiId}`);
      return guestlinks;
    }

    removeGuestLink = async (guestLinkUiId: string): Promise<GuestLink> => {
      if (syncService.isOnline() === false) {
        throw new Error('You must be online to remove a shared link');
      }

      const { guestlink }:{ guestlink:GuestLink } = await httpProxy.deleteReq(`${this.baseUrl}${guestLinkUiId}`);
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

    setHttpProxyAuthentication = ({ token }: UserModel) => {
      const config:Config = { headers: { Authorization: `Token ${token}` } };
      httpProxy.setConfig(config);
    }
}

const guestLinkProxy:IGuestLinkProxy = new GuestLinkProxy();
export default guestLinkProxy;
