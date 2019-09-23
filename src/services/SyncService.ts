import actionManager, { Action, NoActionPendingError } from './ActionManager';
import storageService, { IUserStorageListener } from './StorageService';

export interface ISyncService {
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): boolean;
    isSynced():Promise<boolean>;
    isOfflineModeActivated():boolean;

    setOfflineMode(offlineMode: boolean):void;
    synchronize(): Promise<void>;

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

class SyncService implements ISyncService, IUserStorageListener{
    private offlineModeActivated:boolean = false;

    constructor(){
        window.addEventListener('offline', async (e) => await syncService.setIsOnline(false && this.isOfflineModeActivated() === false ));
        window.addEventListener('online', async (e) => await syncService.setIsOnline(true && this.isOfflineModeActivated() === false ));

        storageService.registerUserStorageListener(this);
    }

    private listeners: ((isOnline: boolean) => void)[] = [];
    private syncListeners: ((context: SyncContext) => void)[] = [];

    registerSyncListener(listener: (context: SyncContext) => void):void{
        this.syncListeners.push(listener);
    }

    unregisterSyncListener(listenerToRemove: (context: SyncContext) => void):void{
        this.syncListeners = this.syncListeners.filter(listener => listener !== listenerToRemove);
    }

    registerIsOnlineListener(listener: (isOnline: boolean) => void):void{
        this.listeners.push(listener);
    }

    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void{
        this.listeners = this.listeners.filter(listener => listener !== listenerToRemove);
    }

    private async triggerIsOnlineChanged(): Promise<void>{
        const isOnline = await this.isOnline();
        this.listeners.map(listener => listener(isOnline));
    }

    private async triggerSyncContextChanged(context: SyncContext): Promise<void>{
        this.syncListeners.map(listener => listener(Object.assign({}, context)));
    }

    isOnlineAndSynced = async(): Promise<boolean> => {
        return this.isOnline() && await this.isSynced();
    };

    isOnline = (): boolean => {
        return window.navigator.onLine && this.isOfflineModeActivated() === false;
    };

    isSynced = async ():Promise<boolean> => {
        return (await actionManager.countAction()) === 0;
    }

    isOfflineModeActivated = ():boolean => {
        return this.offlineModeActivated;
    }

    setOfflineMode(offlineMode: boolean): void {
        this.offlineModeActivated = offlineMode;
        this.setIsOnline(this.isOfflineModeActivated() && window.navigator.onLine);
    }

    setIsOnline = async(isOnline: boolean): Promise<void> => {
        if(isOnline){
            await this.syncStorage();
        }
        
        await this.triggerIsOnlineChanged();
    }

    synchronize = async(): Promise<void> => {
        this.syncStorage();
    }

    private syncStorage = async(): Promise<void> => {
        const nbActionToSync = await actionManager.countAction();
        const context: SyncContext = {
            isSyncing: true,
            totalActionToSync: nbActionToSync,
            remainingActionToSync: nbActionToSync,
        }
        this.triggerSyncContextChanged(context);

        while(1){
            let action: Action;
            try{
                action = await actionManager.getNextActionToPerform();
            }
            catch(error){
                if(error instanceof NoActionPendingError){
                    this.triggerEndSync(context);
                    return;
                }

                console.log(error);
                this.triggerEndSync(context);
                return;
            }

            try{
                await actionManager.performAction(action);
                context.remainingActionToSync--;
                this.triggerSyncContextChanged(context);
            }
            catch(error){
                await actionManager.putBackAction(action);

                console.log(error);
                this.triggerEndSync(context);
                return;
            }
        }
    }

    private triggerEndSync(context: SyncContext){
        context.isSyncing = false;
        this.triggerSyncContextChanged(context);
    }

    async onUserStorageOpened(): Promise<void> {
        return this.setIsOnline(this.isOfflineModeActivated() === false && window.navigator.onLine);
    }

    async onUserStorageClosed(): Promise<void> {}
}

const syncService = new SyncService();

export default syncService as ISyncService;