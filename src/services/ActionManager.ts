/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
import * as log from 'loglevel';
import { CancelTokenSource } from 'axios';
import httpProxy from './HttpProxy';

import storageService, { IUserStorageListener } from './StorageService';
import { ImageModel } from '../types/Types';

import { dataURItoBlob } from '../helpers/ImageHelper';
import HttpError from '../http/HttpError';

// eslint-disable-next-line no-shadow
export enum ActionType{
    Post,
    Delete,
    CreateImage,
}

export interface Action{
    type: ActionType,
    key:string,
    data?:any
}

export interface IActionManager{
    addAction(action: Action): Promise<void>;
    getNextActionToPerform(): Action;
    shiftAction(): Promise<void>;
    countAction(): number;

    performAction (action: Action):Promise<void>;
    cancelAction(): void;

    clearActions(): Promise<void>;

    writeActionsInStorage(): Promise<void>;

    registerOnActionManagerChanged(listener: (actionCounter: number) => void):void;
    unregisterOnActionManagerChanged(listenerToRemove: (actionCounter: number) => void):void;
}

export class NoActionPendingError extends Error {}

class ActionManager implements IActionManager, IUserStorageListener {
    private actions: Action[] = [];

    private cancelTokenSource: CancelTokenSource | undefined;

    private listeners: ((actionCounter: number) => void)[] = [];

    constructor() {
      storageService.registerUserStorageListener(this);

      if (storageService.isUserStorageOpened()) {
        this.getHistoryFromStorage().then((actions) => { this.actions = actions; });
      }
    }

    registerOnActionManagerChanged(listener: (actionCounter: number) => void):void {
      this.listeners.push(listener);
    }

    unregisterOnActionManagerChanged(listenerToRemove: (actionCounter: number) => void):void {
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    async onUserStorageOpened():Promise<void> {
      this.actions = await this.getHistoryFromStorage();
      this.triggerOnActionManagerChanged(this.actions.length);
    }

    async onUserStorageClosed():Promise<void> {
      this.actions = [];
      this.triggerOnActionManagerChanged(this.actions.length);
    }

    private async triggerOnActionManagerChanged(actionCounter: number): Promise<void> {
      this.listeners.map((listener) => listener(actionCounter));
    }

    async addAction(action: Action): Promise<void> {
      this.actions.push(action);
      await this.writeActionsInStorage();
      return this.triggerOnActionManagerChanged(this.actions.length);
    }

    getNextActionToPerform(): Action {
      if (this.actions.length === 0) {
        throw new NoActionPendingError("There isn't pending action anymore");
      }

      return this.actions[0];
    }

    async shiftAction(): Promise<void> {
      if (this.actions.length === 0) {
        throw new NoActionPendingError("There isn't pending action anymore");
      }

      this.actions.shift();
      await this.writeActionsInStorage();
      return this.triggerOnActionManagerChanged(this.actions.length);
    }

    countAction = (): number => this.actions.length

    performAction = async (action: Action):Promise<void> => {
      this.cancelTokenSource = httpProxy.createCancelTokenSource();
      const requestConfig = { cancelToken: this.cancelTokenSource.token };

      if (action.type === ActionType.Post) {
        try {
          await httpProxy.post(action.key, action.data, requestConfig);
        } catch (error) {
          if (error instanceof HttpError && error.data.entity === 'notfound') {
            log.warn(`[${action.key}]: The image was deleted in a further delete action`);
          } else {
            throw error;
          }
        }
      } else if (action.type === ActionType.Delete) {
        try {
          await httpProxy.deleteReq(action.key, requestConfig);
        } catch (error) {
          if (error instanceof HttpError && error.data.entity === 'notfound') {
            log.warn(`[${action.key}]: The entity was already deleted`);
          } else {
            throw error;
          }
        }
      } else if (action.type === ActionType.CreateImage) {
        const imgToSave:ImageModel = action.data as ImageModel;
        if (await storageService.existItem(imgToSave.url) && await storageService.existItem(imgToSave.thumbnailUrl)) {
          const blobImage = dataURItoBlob(await storageService.getItem(imgToSave.url));
          const thumbnail = dataURItoBlob(await storageService.getItem(imgToSave.thumbnailUrl));

          await httpProxy.postImage(action.key, imgToSave, blobImage, thumbnail, requestConfig);
        } else {
          log.warn('The urls are not found in the storage. It seems like they have been deleted in a further delete action ...');
        }
      } else {
        throw new Error(`The action type ${action.type} is not recognized.`);
      }
    }

    cancelAction = () => {
      if (this.cancelTokenSource) {
        this.cancelTokenSource.cancel();
      }
    }

    async clearActions(): Promise<void> {
      this.actions.length = 0;
      await this.writeActionsInStorage();
      this.triggerOnActionManagerChanged(this.actions.length);
    }

    writeActionsInStorage = async (): Promise<void> => {
      this.actions = await storageService.setItem<Action[]>('history', this.actions);
    }

    private getHistoryFromStorage = async ():Promise<Action[]> => storageService.getArray<Action>('history')
}

const actionManager:IActionManager = new ActionManager();
export default actionManager;
