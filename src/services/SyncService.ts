import log from 'loglevel';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, NoActionPendingError } from './ActionManager';
// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';

export interface ISyncService {
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): boolean;
    isSynced():Promise<boolean>;
    isOfflineModeActivated():boolean;

    setOfflineMode(offlineMode: boolean):void;
    synchronize(): Promise<boolean>;

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void;
    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void;

    registerSyncListener(listener: (context: SyncContext) => void):void;
    unregisterSyncListener(listener: (context: SyncContext) => void):void;
}

export type SyncContext = {
    isSyncing: boolean;
    totalActionToSync: number;
    remainingActionToSync: number;
}

let syncService: ISyncService;

class SyncService implements ISyncService, IUserStorageListener {
    private offlineModeActivated:boolean = false;

    constructor() {
      window.addEventListener('offline', async () => (syncService as SyncService).setIsOnline(false && this.isOfflineModeActivated() === false));
      window.addEventListener('online', async () => (syncService as SyncService).setIsOnline(true && this.isOfflineModeActivated() === false));

      storageService.registerUserStorageListener(this);
    }

    private listeners: ((isOnline: boolean) => void)[] = [];

    private syncListeners: ((context: SyncContext) => void)[] = [];

    registerSyncListener(listener: (context: SyncContext) => void):void{
      this.syncListeners.push(listener);
    }

    unregisterSyncListener(listenerToRemove: (context: SyncContext) => void):void{
      this.syncListeners = this.syncListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void{
      this.listeners.push(listener);
    }

    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    private async triggerIsOnlineChanged(): Promise<void> {
      const isOnline = await this.isOnline();
      this.listeners.map((listener) => listener(isOnline));
    }

    private async triggerSyncContextChanged(context: SyncContext): Promise<void> {
      this.syncListeners.map((listener) => listener({ ...context }));
    }

    isOnlineAndSynced = async (): Promise<boolean> => this.isOnline() && this.isSynced();

    isOnline = (): boolean => window.navigator.onLine === true && this.isOfflineModeActivated() === false;

    isSynced = async ():Promise<boolean> => (await actionManager.countAction()) === 0

    isOfflineModeActivated = ():boolean => this.offlineModeActivated

    setOfflineMode(offlineMode: boolean): void {
      this.offlineModeActivated = offlineMode;
      this.setIsOnline(this.isOfflineModeActivated() && window.navigator.onLine);
    }

    setIsOnline = async (isOnline: boolean): Promise<void> => {
      if (isOnline) {
        await this.syncStorage();
      }

      await this.triggerIsOnlineChanged();
    }

    synchronize = async (): Promise<boolean> => this.syncStorage()

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

    async onUserStorageOpened(): Promise<void> {
      return this.setIsOnline(this.isOfflineModeActivated() === false && window.navigator.onLine);
    }

    onUserStorageClosed = async (): Promise<void> => {}
}

syncService = new SyncService();

export default syncService as ISyncService;
