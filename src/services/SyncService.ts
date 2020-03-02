import log from 'loglevel';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action } from './ActionManager';
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
    private readonly syncContext: SyncContext = {
      isSyncing: false,
      totalActionToSync: 0,
      remainingActionToSync: 0,
    };

    private syncListeners: ((context: SyncContext) => void)[] = [];

    constructor() {
      storageService.registerUserStorageListener(this);
      onlineManager.registerIsOnlineListener(this.onIsOnlineChanged);
      actionManager.registerOnActionManagerChanged(this.onActionManagerChanged);

      this.synchronize();
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

    onActionManagerChanged = async (nbAction: number) => {
      if (this.syncContext.isSyncing === false) {
        this.syncContext.totalActionToSync = nbAction;
      }

      this.syncContext.remainingActionToSync = nbAction;
      return this.triggerSyncContextChanged();
    }

    private triggerSyncContextChanged(): void {
      this.syncListeners.map((listener) => listener({ ...this.syncContext }));
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
      this.syncContext.isSyncing = true;
      this.syncContext.totalActionToSync = actionManager.countAction();
      this.syncContext.remainingActionToSync = this.syncContext.totalActionToSync;
      this.triggerSyncContextChanged();

      let success: boolean = true;
      try {
        while (actionManager.countAction() > 0) {
          const action: Action = actionManager.getNextActionToPerform();

          // eslint-disable-next-line no-await-in-loop
          await actionManager.performAction(action);
          // eslint-disable-next-line no-await-in-loop
          await actionManager.shiftAction();
        }
      } catch (error) {
        log.error(error);
        success = false;
      }

      this.syncContext.isSyncing = false;
      this.triggerSyncContextChanged();

      return Promise.resolve(success);
    }
}

const syncService = new SyncService();

export default syncService as ISyncService;
