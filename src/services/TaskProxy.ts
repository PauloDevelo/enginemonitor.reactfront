import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateTask } from '../helpers/TaskHelper'
import { TaskModel} from '../types/Types'


export interface ITaskProxy{
    createOrSaveTask(equipmentId: string, newTask: TaskModel):Promise<TaskModel>;
    deleteTask(equipmentId: string, taskId: string): Promise<TaskModel>;
    fetchTasks(equipmentId: string): Promise<TaskModel[]>;

    existTask(equipmentId: string | undefined, taskId: string | undefined):Promise<boolean>;
}

class TaskProxy implements ITaskProxy{
    baseUrl = process.env.REACT_APP_URL_BASE;

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: TaskModel):Promise<TaskModel> =>{
        newTask = await progressiveHttpProxy.postAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId + '/' + newTask._uiId, "task", newTask, updateTask);

        await storageService.updateArray(this.baseUrl + "tasks/" + equipmentId, newTask);

        return newTask;
    }

    deleteTask = async(equipmentId: string, taskId: string): Promise<TaskModel> => {
        await progressiveHttpProxy.deleteAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId + '/' + taskId, "task", updateTask);

        return storageService.removeItemInArray<TaskModel>(this.baseUrl + "tasks/" + equipmentId, taskId);
    }

    fetchTasks = async(equipmentId: string): Promise<TaskModel[]> => {
        return await progressiveHttpProxy.getArrayOnlineFirst(this.baseUrl + "tasks/" + equipmentId, "tasks", updateTask);
    }

    existTask = async (equipmentId: string | undefined, taskId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || taskId === undefined){
            return false;
        }

        const allTasks = await this.fetchTasks(equipmentId);

        return allTasks.findIndex(task => task._uiId === taskId) !== -1;
    }
}

const taskProxy:ITaskProxy = new TaskProxy();
export default taskProxy;
