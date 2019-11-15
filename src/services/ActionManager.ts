/* eslint-disable max-classes-per-file */

import httpProxy from './HttpProxy';

// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';

export enum ActionType{
    // eslint-disable-next-line no-unused-vars
    Post,
    // eslint-disable-next-line no-unused-vars
    Delete
}

export interface Action{
    type: ActionType,
    key:string,
    data?:any
}

export interface IActionManager{
    addAction(action: Action): Promise<void>;
    getNextActionToPerform(): Promise<Action>;
    putBackAction(action: Action): Promise<void>;
    countAction(): Promise<number>;
    performAction (action: Action):Promise<void>;
    clearActions(): Promise<void>;

    registerOnActionManagerChanged(listener: (actionCounter: number) => void):void;
    unregisterOnActionManagerChanged(listenerToRemove: (actionCounter: number) => void):void;
}

export class NoActionPendingError extends Error {}

class ActionManager implements IActionManager, IUserStorageListener {
    private listeners: ((actionCounter: number) => void)[] = [];

    constructor() {
      storageService.registerUserStorageListener(this);
    }

    registerOnActionManagerChanged(listener: (actionCounter: number) => void):void{
      this.listeners.push(listener);
    }

    unregisterOnActionManagerChanged(listenerToRemove: (actionCounter: number) => void):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    async onUserStorageOpened():Promise<void> {
      const nbAction = await this.countAction();
      this.triggerOnActionManagerChanged(nbAction);
    }

    async onUserStorageClosed():Promise<void> {
      this.triggerOnActionManagerChanged(0);
    }

    private async triggerOnActionManagerChanged(actionCounter: number): Promise<void> {
      this.listeners.map((listener) => listener(actionCounter));
    }

    async addAction(action: Action): Promise<void> {
      const history:Action[] = await this.getHistoryFromStorage();

      history.push(action);

      const actions = await storageService.setItem<Action[]>('history', history);
      this.triggerOnActionManagerChanged(actions.length);
    }

    async getNextActionToPerform(): Promise<Action> {
      const history:Action[] = await this.getHistoryFromStorage();
      const action = history.shift();

      if (!action) {
        throw new NoActionPendingError("There isn't pending action anymore");
      }

      const actions = await storageService.setItem<Action[]>('history', history);
      this.triggerOnActionManagerChanged(actions.length);

      return action;
    }

    async putBackAction(action: Action): Promise<void> {
      let newHistory: Action[] = [];
      newHistory.push(action);

      const history:Action[] = await this.getHistoryFromStorage();

      newHistory = newHistory.concat(history);

      const actions = await storageService.setItem<Action[]>('history', newHistory);
      this.triggerOnActionManagerChanged(actions.length);
    }

    countAction = async (): Promise<number> => {
      if (storageService.isUserStorageOpened() === false) {
        return 0;
      }

      const actions = await storageService.getArray<Action>('history');
      return actions.length;
    }

    performAction = async (action: Action):Promise<void> => {
      if (action.type === ActionType.Post) {
        await httpProxy.post(action.key, action.data);
      } else if (action.type === ActionType.Delete) {
        await httpProxy.deleteReq(action.key);
      } else {
        throw new Error(`The action type ${action.type} is not recognized.`);
      }
    }

    async clearActions(): Promise<void> {
      const actions = await storageService.setItem<Action[]>('history', []);
      this.triggerOnActionManagerChanged(actions.length);
    }

    private getHistoryFromStorage = async ():Promise<Action[]> => {
      let history:Action[] = await storageService.getItem<Action[]>('history');
      history = history || [];

      return history;
    }
}

const actionManager:IActionManager = new ActionManager();
export default actionManager;
