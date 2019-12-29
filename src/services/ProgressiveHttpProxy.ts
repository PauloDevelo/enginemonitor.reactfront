/* eslint-disable class-methods-use-this */

// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import HttpError from '../http/HttpError';
// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';

import syncService from './SyncService';
import httpProxy from './HttpProxy';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, ActionType } from './ActionManager';
import storageService from './StorageService';

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
    postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update:(date:T)=>T):Promise<T>;

    /**
     * This function excute the http delete query and call the update function in the returned data.
     * In offline mode, this function will add an action in the history.
     * @param url The delete query url
     * @param keyName The field name that contain the data to return.
     * @param update The function that will update the data before returning it to the callee
     */
    deleteAndUpdate<T>(url: string, keyName: string, update:(data:T)=>T):Promise<void>;

    /**
     * This function returns an array of T element and update the array in the user storage if online.
     * If in offline mode, we will get the array from the user storage.
     * @param url the get query url
     * @param keyName The field name that contain the array
     * @param init The function init to call on each item before returning the array to the callee
     */
    getArrayOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T, cancelToken?: CancelToken | undefined): Promise<T[]>;

    /**
     * This function returns a T element and update it in the user storage if online.
     * If in offline mode, we will get the array from the user storage.
     * @param url the get query url
     * @param keyName The field name that contain the array
     * @param init The function init to call on each item before returning the array to the callee
     */
    getOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T, cancelToken?: CancelToken | undefined): Promise<T>;
}

class ProgressiveHttpProxy implements ISyncHttpProxy {
  async postNewImage(createImageUrl: string, imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob): Promise<ImageModel> {
    const addCreateImageAction = async () => {
      const action: Action = { key: createImageUrl, type: ActionType.CreateImage, data: imgToSave };
      await actionManager.addAction(action);
    };

    if (await syncService.isOnlineAndSynced()) {
      try {
        const { image } = await httpProxy.postImage(createImageUrl, imgToSave, blobImage, thumbnail);
        return image;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
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

  async postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update:(data:T)=>T):Promise<T> {
    const data:any = { [keyName]: dataToPost };

    const addPostAction = async () => {
      const action: Action = { key: url, type: ActionType.Post, data };
      await actionManager.addAction(action);
    };

    if (await syncService.isOnlineAndSynced()) {
      try {
        const savedData = (await httpProxy.post(url, data))[keyName];

        return update(savedData);
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
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

  async deleteAndUpdate<T>(url: string, keyName: string, update:(data:T)=>T):Promise<void> {
    const addDeleteAction = () => {
      const action: Action = { key: url, type: ActionType.Delete };
      actionManager.addAction(action);
    };

    if (await syncService.isOnlineAndSynced()) {
      try {
        const deletedEntity = (await httpProxy.deleteReq(url))[keyName];
        update(deletedEntity);
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          addDeleteAction();
        } else {
          throw reason;
        }
      }
    } else {
      addDeleteAction();
    }
  }

  async getArrayOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T, cancelToken: CancelToken | undefined = undefined): Promise<T[]> {
    if (await syncService.isOnlineAndSynced()) {
      try {
        const array = (await httpProxy.get(url, cancelToken))[keyName] as T[];
        const initArray = array.map(init);

        storageService.setItem<T[]>(url, initArray);

        return initArray;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          return storageService.getArray<T>(url);
        }
        throw reason;
      }
    }

    return storageService.getArray<T>(url);
  }

  async getOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T, cancelToken: CancelToken | undefined = undefined): Promise<T> {
    if (await syncService.isOnlineAndSynced()) {
      try {
        const item = (await httpProxy.get(url, cancelToken))[keyName] as T;
        const updatedItem = init(item);

        storageService.setItem<T>(url, updatedItem);

        return updatedItem;
      } catch (reason) {
        if (reason instanceof HttpError && reason.didConnectionAbort()) {
          return storageService.getItem<T>(url);
        }
        throw reason;
      }
    }

    return storageService.getItem<T>(url);
  }
}

const progressiveHttpProxy:ISyncHttpProxy = new ProgressiveHttpProxy();
export default progressiveHttpProxy;
