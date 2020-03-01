// eslint-disable-next-line no-unused-vars
import log from 'loglevel';

// eslint-disable-next-line no-unused-vars
import actionManager from './ActionManager';

import httpProxy from './HttpProxy';

export interface IOnlineManager {
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): Promise<boolean>;
    isSynced():Promise<boolean>;
    isOfflineModeActivated():boolean;

    setOfflineMode(offlineMode: boolean):void;

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void;
    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void;
}

let onlineManager: IOnlineManager;

class OnlineManager implements IOnlineManager {
    private offlineModeActivated:boolean = false;

    private listeners: ((isOnline: boolean) => void)[] = [];

    constructor() {
      window.addEventListener('offline', async () => (onlineManager as OnlineManager).setIsOnline(await onlineManager.isOnline()));
      window.addEventListener('online', async () => (onlineManager as OnlineManager).setIsOnline(await onlineManager.isOnline()));
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

    onUserStorageClosed = async (): Promise<void> => {}

    private async triggerIsOnlineChanged(isOnline: boolean): Promise<void> {
      this.listeners.map((listener) => listener(isOnline));
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
      if (isOnline !== this.prevIsOnline) {
        await this.triggerIsOnlineChanged(isOnline);
        this.prevIsOnline = isOnline;
      }
    }
}

onlineManager = new OnlineManager();

export default onlineManager as IOnlineManager;
