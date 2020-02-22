import log from 'loglevel';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, NoActionPendingError } from './ActionManager';
// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';
import httpProxy from './HttpProxy';

export interface ISyncService {
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): Promise<boolean>;
    isSynced():Promise<boolean>;
    isOfflineModeActivated():boolean;

    setOfflineMode(offlineMode: boolean):void;
    synchronize(): Promise<boolean>;
    cancelSync(): void;

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

    private listeners: ((isOnline: boolean) => void)[] = [];

    private syncListeners: ((context: SyncContext) => void)[] = [];

    constructor() {
      window.addEventListener('offline', async () => (syncService as SyncService).setIsOnline(await syncService.isOnline()));
      window.addEventListener('online', async () => (syncService as SyncService).setIsOnline(await syncService.isOnline()));

      storageService.registerUserStorageListener(this);
    }

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

    isOnline = async (): Promise<boolean> => window.navigator.onLine === true && this.isOfflineModeActivated() === false && this.isBackEndReachable()

    isSynced = async ():Promise<boolean> => (await actionManager.countAction()) === 0

    isOnlineAndSynced = async (): Promise<boolean> => await this.isOnline() && this.isSynced();

    isOfflineModeActivated = ():boolean => this.offlineModeActivated

    setOfflineMode(offlineMode: boolean): void {
      this.offlineModeActivated = offlineMode;
      this.isOnline().then((isOnline) => this.setIsOnline(isOnline));
    }

    synchronize = async (): Promise<boolean> => this.syncStorage()

    cancelSync = () => {
      actionManager.cancelAction();
    }

    async onUserStorageOpened(): Promise<void> {
      return this.setIsOnline(await this.isOnline());
    }

    onUserStorageClosed = async (): Promise<void> => {}

    private async triggerIsOnlineChanged(isOnline: boolean): Promise<void> {
      this.listeners.map((listener) => listener(isOnline));
    }

    private async triggerSyncContextChanged(context: SyncContext): Promise<void> {
      this.syncListeners.map((listener) => listener({ ...context }));
    }

    private isBackEndReachable = async (): Promise<boolean> => {
      try {
        const { pong } = await httpProxy.get(`${process.env.REACT_APP_API_URL_BASE}server/ping`, { timeout: 1000 });
        return pong;
      } catch (error) {
        return Promise.resolve(false);
      }
    }

    private prevIsOnline: boolean | undefined;

    private setIsOnline = async (isOnline: boolean): Promise<void> => {
      if (isOnline && isOnline !== this.prevIsOnline) {
        await this.syncStorage();
      }

      if (isOnline !== this.prevIsOnline) {
        await this.triggerIsOnlineChanged(isOnline);
        this.prevIsOnline = isOnline;
      }
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

syncService = new SyncService();

export default syncService as ISyncService;
