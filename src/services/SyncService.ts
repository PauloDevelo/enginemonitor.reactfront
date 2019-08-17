import actionManager, { Action, NoActionPendingError } from './ActionManager';
import storageService, { IUserStorageListener } from './StorageService';
import { async } from 'q';

export interface ISyncService {
    registerIsOnlineListener(listener: (isOnline: boolean) => void):void;
    unregisterIsOnlineListener(listenerToRemove: (isOnline: boolean) => void):void;
    isOnlineAndSynced(): Promise<boolean>;
    isOnline(): boolean;
    isSynced():Promise<boolean>;

    synchronize(): Promise<void>;
}

class SyncService implements ISyncService, IUserStorageListener{
    constructor(){
        storageService.registerUserStorageListener(this);
    }

    private listeners: ((isOnline: boolean) => void)[] = [];

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

    isOnlineAndSynced = async(): Promise<boolean> => {
        return this.isOnline() && await this.isSynced();
    };

    isOnline = (): boolean => {
        return window.navigator.onLine;
    };

    isSynced = async ():Promise<boolean> => {
        return (await actionManager.countAction()) === 0;
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
        while(1){
            let action: Action;
            try{
                action = await actionManager.getNextActionToPerform();
            }
            catch(error){
                if(error instanceof NoActionPendingError){
                    return;
                }

                console.log(error);
                return;
            }

            try{
                await actionManager.performAction(action);
            }
            catch(error){
                console.log(error);
                await actionManager.putBackAction(action);
                return;
            }
        }
    }

    async onUserStorageOpened(): Promise<void> {
        return this.setIsOnline(window.navigator.onLine);
    }

    async onUserStorageClosed(): Promise<void> {}
}

const syncService = new SyncService();

window.addEventListener('offline', async (e) => await syncService.setIsOnline(false));
window.addEventListener('online', async (e) => await syncService.setIsOnline(true));

export default syncService as ISyncService;