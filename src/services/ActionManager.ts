import httpProxy from './HttpProxy';
import storageService  from './StorageService';

export enum ActionType{
    Post,
    Delete
}

export interface Action{
    type: ActionType,
    key:string,
    data?:any
};

export interface IActionManager{
    addAction(action: Action): Promise<void>;
    shiftAction(): Promise<Action>;
    putBackAction(action: Action): Promise<void>;
    countAction(): Promise<number>;
    performAction (action: Action):Promise<void>;
}

class ActionManager implements IActionManager{
    async addAction(action: Action): Promise<void>{
        let history:Action[] = await storageService.getItem<Action[]>("history");
        history = history === null ? [] : history;

        history.push(action);

        await storageService.setItem<Action[]>("history", history);
    }

    async shiftAction(): Promise<Action>{
        let action: Action | undefined;
        let history:Action[] = await storageService.getItem<Action[]>("history");
        history = history === null ? [] : history;

        action = history.shift()

        if(!action)
        {
            throw new Error("There isn't pending action anymore");
        }

        await storageService.setItem<Action[]>("history", history);

        return action;
    }

    async putBackAction(action: Action): Promise<void> {
        let newHistory: Action[] = [];
        newHistory.push(action);

        let  history:Action[] = await storageService.getItem<Action[]>("history");
        history = history === null ? [] : history;

        newHistory = newHistory.concat(history);

        await storageService.setItem<Action[]>("history", newHistory);
    }

    async countAction(): Promise<number>{
        const history = (await storageService.getItem<Action[]>("history"));
        return history ? history.length : 0;
    }

    performAction = async (action: Action):Promise<void> => {
        if(action.type === ActionType.Post){
            await httpProxy.post(action.key, action.data);
        }
        else if(action.type === ActionType.Delete){
            await httpProxy.deleteReq(action.key);
        }
        else{
            throw new Error("The action type " + action.type + "is not recognized.");
        }
    }

}

const actionManager:IActionManager = new ActionManager();
export default actionManager;