import syncService from './SyncService';
import httpProxy from './HttpProxy';

import actionManager, { Action, ActionType } from './ActionManager';
import storageService from './StorageService';
import { CancelToken } from 'axios';

/**
 * This interface is an enhanced http proxy that manages offline mode.
 */
export interface ISyncHttpProxy{
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
}

class ProgressiveHttpProxy implements ISyncHttpProxy{

    async postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update:(data:T)=>T):Promise<T> {
        const data:any = {[keyName]: dataToPost};

        if(await syncService.isOnlineAndSynced()){
            const savedData = (await httpProxy.post(url, data))[keyName];

            return update(savedData);
        }
        else{
            const action: Action = { key: url, type: ActionType.Post, data: data };
            await actionManager.addAction(action);

            return dataToPost;
        }
    }

    async deleteAndUpdate<T>(url: string, keyName: string, update:(data:T)=>T):Promise<void>{
        if(await syncService.isOnlineAndSynced()){
            const deletedEntity = (await httpProxy.deleteReq(url))[keyName];
            update(deletedEntity);
        }
        else{
            const action: Action = { key: url, type: ActionType.Delete };
            actionManager.addAction(action);
        }
    }

    async getArrayOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T, cancelToken: CancelToken | undefined = undefined): Promise<T[]> {
        if(await syncService.isOnlineAndSynced()){
            const array = (await httpProxy.get(url, cancelToken))[keyName] as T[];
            const initArray = array.map(init);

            storageService.setItem<T[]>(url, initArray);

            return initArray;
        }
        
        return await storageService.getArray<T>(url);
    }
}

const progressiveHttpProxy:ISyncHttpProxy = new ProgressiveHttpProxy();
export default progressiveHttpProxy;
