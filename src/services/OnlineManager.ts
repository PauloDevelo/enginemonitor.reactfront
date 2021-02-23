/* eslint-disable no-unused-vars */
import actionManager from './ActionManager';

import httpProxy from './HttpProxy';
import analytics from '../helpers/AnalyticsHelper';

export interface IOnlineManager {
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): Promise<boolean>;
    isSynced(): boolean;
    isOfflineModeActivated():boolean;

    setOfflineMode(offlineMode: boolean):void;

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void;
    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void;
}

let onlineManager: IOnlineManager;

class OnlineManager implements IOnlineManager {
    private firstCheckBackendReachability: Promise<void>;

    private backendReachable: boolean|undefined = undefined;

    private offlineModeActivated:boolean = false;

    private listeners: ((isOnline: boolean) => void)[] = [];

    constructor() {
      window.addEventListener('offline', async () => (onlineManager as OnlineManager).setIsOnline(await onlineManager.isOnline()));
      window.addEventListener('online', async () => (onlineManager as OnlineManager).setIsOnline(await onlineManager.isOnline()));

      this.firstCheckBackendReachability = this.checkBackendReachability();
      setInterval(this.checkBackendReachability, 15000);
    }

    // Function for the unit test. Since we cannot un load a module with import, I simulate a rebuild of onlineManager....
    rebuild() {
      this.backendReachable = undefined;
      this.offlineModeActivated = false;
      this.listeners = [];

      this.firstCheckBackendReachability = this.checkBackendReachability();
      setInterval(this.checkBackendReachability, 15000);
    }

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void {
      this.listeners.push(listener);
    }

    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void {
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    isOnline = async (): Promise<boolean> => window.navigator.onLine === true && this.isOfflineModeActivated() === false && this.isBackendReachable()

    isSynced = ():boolean => actionManager.countAction() === 0

    isOnlineAndSynced = async (): Promise<boolean> => this.isSynced() && this.isOnline();

    isOfflineModeActivated = ():boolean => this.offlineModeActivated

    setOfflineMode(offlineMode: boolean): void {
      this.offlineModeActivated = offlineMode;
      this.isOnline().then((isOnline) => this.setIsOnline(isOnline));
      analytics.setOffLineMode(offlineMode);
    }

    onUserStorageClosed = async (): Promise<void> => {}

    private async triggerIsOnlineChanged(isOnline: boolean): Promise<void> {
      this.listeners.map((listener) => listener(isOnline));
    }

    private checkBackendReachability = async (): Promise<void> => {
      try {
        const { pong } = await httpProxy.get(`${process.env.REACT_APP_API_URL_BASE}server/ping`, { timeout: 8000 });
        this.setBackendReachable(pong);
      } catch (error) {
        this.setBackendReachable(false);
      }
    }

    private setBackendReachable = (backendReachable: boolean) => {
      if (this.backendReachable !== backendReachable) {
        this.backendReachable = backendReachable;
        this.isOnline().then((isOnline) => this.setIsOnline(isOnline));
      }
    }

    private isBackendReachable = async (): Promise<boolean> => {
      if (this.backendReachable === undefined) {
        await this.firstCheckBackendReachability;
      }

      return this.backendReachable!;
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
