import actionManager, { Action, ActionType } from './ActionManager';

export interface ISyncService{
    isOnline(): Promise<boolean>;
}

class SyncService implements ISyncService{

    isOnline = async(): Promise<boolean> => {
        return window.navigator.onLine && (await actionManager.countAction()) === 0;
    };

    setIsOnline = async(isOnline: boolean): Promise<void> => {
        if(isOnline){
            await this.syncStorage();
        }
    }

    syncStorage = async(): Promise<void> => {
        while(1){
            let action: Action;
            try{
                action = await actionManager.getNextActionToPerform();
            }
            catch(error){
                return;
                // No action anymore
            }

            try{
                actionManager.performAction(action);
            }
            catch(error){
                console.log(error);
                actionManager.putBackAction(action);
                throw error;
            }
        }
    }
}

const syncService = new SyncService();

window.addEventListener('offline', (e) => syncService.setIsOnline(false));
window.addEventListener('online', (e) => syncService.setIsOnline(true));

export default syncService as ISyncService;