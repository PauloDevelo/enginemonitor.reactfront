/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import log from 'loglevel';
import HttpError from '../http/HttpError';
// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';

import onlineManager from './OnlineManager';
import httpProxy from './HttpProxy';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, ActionType } from './ActionManager';
import storageService from './StorageService';
import userContext from './UserContext';
import assetManager from './AssetManager';
import analytics from '../helpers/AnalyticsHelper';

const timeouts = {
  postImage: 5000,
  post: 2000,
  delete: 2000,
  get: 2000,
  notStoredGet: 0,
};

export interface GetRequest<T>{
  url: string;
  init?:(model:T) => T;
}

export interface GetOnlineRequest<T> extends GetRequest<T>{
  keyName:string;
  cancelToken?: CancelToken | undefined;
  cancelTimeout?: boolean;
}

/**
 * This interface is an enhanced http proxy that manages offline mode.
 */
export interface ISyncHttpProxy{
    /**
     * This function will try to post a new image into a back end. If it cannot, the image creation will be added into the action manager.
     * @param createImageUrl Url to post the new image
     * @param imgToSave image data model to save
     * @param blobImage Blob containing the image
     * @param thumbnail Blob containing the thumbnail
     */
    postNewImage(createImageUrl: string, imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob): Promise<ImageModel>;

    /**
     * This function execute an http post query and call the function update in the element's "keyname" field returned by the query.
     * In offline mode, this function will add an action in the history.
     * @param url Post url
     * @param keyName The field name that contains the data to return after calling update on it
     * @param dataToPost The data to send. The data will be in the field keyname of a container.
     * @param update Function that will update the returned data before sending it back the the callee.
     */
    postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update?:(date:T)=>T, checkReadOnlyCredentials?: boolean):Promise<T>;

    /**
     * This function execute the http delete query and call the update function in the returned data.
     * In offline mode, this function will add an action in the history.
     * @param url The delete query url
     */
    delete<T>(url: string):Promise<void>;

    /**
     * This function execute the http delete query and call the update function in the returned data.
     * In offline mode, this function will throw an exception.
     * @param url The delete query url
     */
    deleteOnlyOnline<T>(url: string):Promise<void>;

    /**
     * This function returns an array of T element and update the array in the user storage if online.
     * If in offline mode, we will get the array from the user storage.
     * @param url the get query url
     * @param keyName The field name that contain the array
     * @param init The function init to call on each item before returning the array to the callee
     */
    getArrayOnlineFirst<T>(props: GetOnlineRequest<T>): Promise<T[]>;

    getArrayFromStorage<T>(props: GetRequest<T>): Promise<T[]>;

    /**
     * This function returns a T element and update it in the user storage if online.
     * If in offline mode, we will get the array from the user storage.
     * @param url the get query url
     * @param keyName The field name that contain the array
     * @param init The function init to call on each item before returning the array to the callee
     */
    getOnlineFirst<T>(url: string, keyName:string, init?:(model:T) => T, cancelToken?: CancelToken | undefined): Promise<T>;

    getFromStorage<T>(key: string, init?:(model:T) => T): Promise<T>
}

class ProgressiveHttpProxy implements ISyncHttpProxy {
  async postNewImage(createImageUrl: string, imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob): Promise<ImageModel> {
    this.checkUserCredentialForUploadingImages();

    const addCreateImageAction = async () => {
      const action: Action = { key: createImageUrl, type: ActionType.CreateImage, data: imgToSave };
      await actionManager.addAction(action);
    };

    if (await onlineManager.isOnlineAndSynced()) {
      try {
        const { image } = await httpProxy.postImage(createImageUrl, imgToSave, blobImage, thumbnail, { timeout: timeouts.postImage });
        return image;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the post image ${createImageUrl}`);
          analytics.httpRequestTimeout({ requestType: 'post_image', url: createImageUrl, timeout: timeouts.postImage });
          await addCreateImageAction();
        } else {
          throw reason;
        }
      }
    } else {
      await addCreateImageAction();
    }

    return { ...imgToSave, sizeInByte: 450 * 1024 };
  }

  async postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update?:(data:T)=>T, checkReadOnlyCredentials = true):Promise<T> {
    if (checkReadOnlyCredentials) {
      this.checkUserCredentialForPostingOrDeleting();
    }

    const data:any = { [keyName]: dataToPost };

    const addPostAction = async () => {
      const action: Action = { key: url, type: ActionType.Post, data };
      await actionManager.addAction(action);
    };

    if (await onlineManager.isOnlineAndSynced()) {
      try {
        const savedData = (await httpProxy.post(url, data, { timeout: timeouts.post }))[keyName];

        return update ? update(savedData) : savedData;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the post ${url}`);
          analytics.httpRequestTimeout({ requestType: 'post', url, timeout: timeouts.post });
          await addPostAction();
        } else {
          throw reason;
        }
      }
    } else {
      await addPostAction();
    }

    return dataToPost;
  }

  async deleteOnlyOnline<T>(url: string):Promise<void> {
    // this.checkUserCredentialForPostingOrDeleting();

    if (await onlineManager.isOnline()) {
      try {
        await httpProxy.deleteReq(url);
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the delete ${url}`);
          analytics.httpRequestTimeout({ requestType: 'delete', url, timeout: timeouts.delete });
        }
        throw reason;
      }
    } else {
      throw new HttpError('offline');
    }
  }

  async delete<T>(url: string):Promise<void> {
    this.checkUserCredentialForPostingOrDeleting();

    const addDeleteAction = () => {
      const action: Action = { key: url, type: ActionType.Delete };
      actionManager.addAction(action);
    };

    if (await onlineManager.isOnlineAndSynced()) {
      try {
        await httpProxy.deleteReq(url, { timeout: timeouts.delete });
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the delete ${url}`);
          analytics.httpRequestTimeout({ requestType: 'delete', url, timeout: timeouts.delete });
          addDeleteAction();
        } else {
          throw reason;
        }
      }
    } else {
      addDeleteAction();
    }
  }

  async getArrayOnlineFirst<T>({
    url, keyName, init, cancelToken, cancelTimeout,
  }: GetOnlineRequest<T>): Promise<T[]> {
    if (await onlineManager.isOnlineAndSynced()) {
      const timeout = await this.getGetTimeout(url, cancelTimeout);
      try {
        const array = (await httpProxy.get(url, { cancelToken, timeout }))[keyName] as T[];

        const initArray = init ? array.map(init) : array;

        storageService.setItem<T[]>(url, initArray);

        return initArray;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the get ${url}`);
          analytics.httpRequestTimeout({ requestType: 'get', url, timeout });
          return this.getArrayFromStorage<T>({ url, init });
        }
        throw reason;
      }
    }

    return this.getArrayFromStorage<T>({ url, init });
  }

  async getArrayFromStorage<T>({ url, init }: GetRequest<T>) {
    const array = await storageService.getArray<T>(url);
    return init ? array.map(init) : array;
  }

  async getOnlineFirst<T>(url: string, keyName:string, init?:(model:T) => T, cancelToken: CancelToken | undefined = undefined): Promise<T> {
    if (await onlineManager.isOnlineAndSynced()) {
      const timeout = await this.getGetTimeout(url);
      try {
        const item = (await httpProxy.get(url, { cancelToken, timeout }))[keyName] as T;
        const updatedItem = init ? init(item) : item;

        storageService.setItem<T>(url, updatedItem);

        return updatedItem;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          log.warn(`timeout for the get ${url}`);
          analytics.httpRequestTimeout({ requestType: 'get', url, timeout });
          return this.getFromStorage<T>(url, init);
        }
        throw reason;
      }
    }

    return this.getFromStorage<T>(url, init);
  }

  async getFromStorage<T>(key: string, init?:(model:T) => T) {
    const item = await storageService.getItem<T>(key);
    return init ? init(item) : item;
  }

  private checkUserCredentialForUploadingImages() {
    if (userContext.getCurrentUser() === undefined || userContext.getCurrentUser()?.forbidUploadingImage === undefined || userContext.getCurrentUser()?.forbidUploadingImage) {
      throw new HttpError({ message: 'credentialError' });
    }
  }

  private checkUserCredentialForPostingOrDeleting() {
    if (assetManager.getUserCredentials() === undefined || assetManager.getUserCredentials()?.readonly === undefined || assetManager.getUserCredentials()?.readonly) {
      throw new HttpError({ message: 'credentialError' });
    }
  }

  private async getGetTimeout(url: string, cancelTimeout?: boolean): Promise<number> {
    if (cancelTimeout === true) {
      return 0;
    }

    if (await storageService.existItem(url) === false) {
      return timeouts.notStoredGet;
    }

    return timeouts.get;
  }
}

const progressiveHttpProxy:ISyncHttpProxy = new ProgressiveHttpProxy();
export default progressiveHttpProxy;
