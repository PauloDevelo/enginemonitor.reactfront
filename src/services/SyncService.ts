import actionManager, { Action, ActionType } from './ActionManager';

window.addEventListener('offline', (e) => setIsOnline(false));
window.addEventListener('online', (e) => setIsOnline(true));

async function isOnline(): Promise<boolean>{
    return window.navigator.onLine && (await actionManager.countAction()) === 0;
};

async function setIsOnline(isOnline: boolean){
    if(isOnline){
        await syncStorage();
    }
}

async function syncStorage() {
    try{
        while(1){
            const action = await actionManager.shiftAction();

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
    catch(error){
        //No action anymore or an error happened.
    }
}

export default isOnline;