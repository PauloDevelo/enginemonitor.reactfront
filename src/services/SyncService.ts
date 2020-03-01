import log from 'loglevel';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, NoActionPendingError } from './ActionManager';
// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';
import onlineManager from './OnlineManager';

export interface ISyncService {
    synchronize(): Promise<boolean>;
    cancelSync(): void;

    registerSyncListener(listener: (context: SyncContext) => void):void;
    unregisterSyncListener(listener: (context: SyncContext) => void):void;
}

export type SyncContext = {
    isSyncing: boolean;
    totalActionToSync: number;
    remainingActionToSync: number;
}

class SyncService implements ISyncService, IUserStorageListener {
    private syncListeners: ((context: SyncContext) => void)[] = [];

    constructor() {
      storageService.registerUserStorageListener(this);
      onlineManager.registerIsOnlineListener(this.onIsOnlineChanged);
    }

    registerSyncListener(listener: (context: SyncContext) => void):void{
      this.syncListeners.push(listener);
    }

    unregisterSyncListener(listenerToRemove: (context: SyncContext) => void):void{
      this.syncListeners = this.syncListeners.filter((listener) => listener !== listenerToRemove);
    }

    onIsOnlineChanged = async (online: boolean): Promise<void> => {
      if (online) {
        const synchronizationPromise = async () => { await this.synchronize(); };
        return synchronizationPromise();
      }

      return Promise.resolve();
    }

    async onUserStorageOpened(): Promise<void> {
      const synchronizationPromise = async () => { await this.synchronize(); };
      return synchronizationPromise();
    }

    onUserStorageClosed = async (): Promise<void> => {}

    private async triggerSyncContextChanged(context: SyncContext): Promise<void> {
      this.syncListeners.map((listener) => listener({ ...context }));
    }

    synchronize = async (): Promise<boolean> => {
      if (storageService.isUserStorageOpened() === false) {
        return Promise.resolve(false);
      }

      if ((await onlineManager.isOnline()) === false) {
        return Promise.resolve(false);
      }

      return this.syncStorage();
    }

    cancelSync = () => {
      actionManager.cancelAction();
    }

    private syncStorage = async (): Promise<boolean> => {
      const nbActionToSync = await actionManager.countAction();
      const context: SyncContext = {
        isSyncing: true,
        totalActionToSync: nbActionToSync,
        remainingActionToSync: nbActionToSync,
      };
      this.triggerSyncContextChanged(context);

      let success = false;
      let stopCondition = false;
      while (stopCondition === false) {
        let action: Action;
        try {
          // eslint-disable-next-line no-await-in-loop
          action = await actionManager.getNextActionToPerform();
        } catch (error) {
          if (error instanceof NoActionPendingError === false) {
            log.error(error);
          } else {
            success = true;
          }

          stopCondition = true;
          break;
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          await actionManager.performAction(action);
          context.remainingActionToSync--;
          this.triggerSyncContextChanged(context);
        } catch (error) {
          // eslint-disable-next-line no-await-in-loop
          await actionManager.putBackAction(action);

          log.error(error);
          stopCondition = true;
        }
      }

      this.triggerEndSync(context);
      return Promise.resolve(success);
    }

    private triggerEndSync(context: SyncContext) {
      const newContext = { ...context };
      newContext.isSyncing = false;
      this.triggerSyncContextChanged(newContext);
    }
}

const syncService = new SyncService();

export default syncService as ISyncService;
