import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateTask } from '../helpers/TaskHelper'
import { TaskModel} from '../types/Types'


export interface ITaskProxy{
    createOrSaveTask(equipmentId: string, newTask: TaskModel):Promise<TaskModel>;
    deleteTask(equipmentId: string, taskId: string): Promise<TaskModel>;
    fetchTasks(equipmentId: string, forceToLookUpInStorage: boolean): Promise<TaskModel[]>;

    existTask(equipmentId: string | undefined, taskId: string | undefined):Promise<boolean>;
}

class TaskProxy implements ITaskProxy{
    baseUrl = process.env.REACT_APP_URL_BASE + "tasks/";

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: TaskModel):Promise<TaskModel> =>{
        newTask = await progressiveHttpProxy.postAndUpdate<TaskModel>(this.baseUrl + equipmentId + '/' + newTask._uiId, "task", newTask, updateTask);

        await storageService.updateArray(this.baseUrl + equipmentId, newTask);

        return newTask;
    }

    deleteTask = async(equipmentId: string, taskId: string): Promise<TaskModel> => {
        await progressiveHttpProxy.deleteAndUpdate<TaskModel>(this.baseUrl + equipmentId + '/' + taskId, "task", updateTask);

        const removedTask = await storageService.removeItemInArray<TaskModel>(this.baseUrl + equipmentId, taskId);
        return updateTask(removedTask);
    }

    fetchTasks = async(equipmentId: string, forceToLookUpInStorage: boolean = false): Promise<TaskModel[]> => {
        if(forceToLookUpInStorage){
            return await storageService.getArray(this.baseUrl + equipmentId);
        }

        return await progressiveHttpProxy.getArrayOnlineFirst(this.baseUrl + equipmentId, "tasks", updateTask);
    }

    existTask = async (equipmentId: string | undefined, taskId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || taskId === undefined){
            console.error("The function TaskProxy.existTask expects a non null and non undefined task id.")
            return false;
        }

        const allTasks = await this.fetchTasks(equipmentId, true);

        return allTasks.findIndex(task => task._uiId === taskId) !== -1;
    }
}

const taskProxy:ITaskProxy = new TaskProxy();
export default taskProxy;
