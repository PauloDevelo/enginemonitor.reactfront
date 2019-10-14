import progressiveHttpProxy from './ProgressiveHttpProxy';

import entryProxy from './EntryProxy';
import imageProxy from './ImageProxy';

import storageService from './StorageService';

import { updateTask, updateRealtimeFields } from '../helpers/TaskHelper'
import { TaskModel} from '../types/Types'


export interface ITaskProxy{
    createOrSaveTask(equipmentId: string, newTask: TaskModel):Promise<TaskModel>;
    deleteTask(equipmentId: string, taskId: string): Promise<TaskModel>;
    fetchTasks(equipmentId: string): Promise<TaskModel[]>;

    existTask(equipmentId: string | undefined, taskId: string | undefined):Promise<boolean>;

    onEquipmentDeleted(equipmentId: string): Promise<void>;
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
        await entryProxy.onTaskDeleted(equipmentId, taskId);
        await imageProxy.onEntityDeleted(taskId);

        return updateTask(removedTask);
    }

    fetchTasks = async(equipmentId: string, forceToLookUpInStorage: boolean = false): Promise<TaskModel[]> => {
        if(forceToLookUpInStorage){
            return await storageService.getArray(this.baseUrl + equipmentId);
        }

        const tasks:TaskModel[] = await progressiveHttpProxy.getArrayOnlineFirst(this.baseUrl + equipmentId, "tasks", updateTask);
        await Promise.all(tasks.map(async (task) => {
            await updateRealtimeFields(equipmentId, task);
        }));

        return tasks;
    }

    existTask = async (equipmentId: string | undefined, taskId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || taskId === undefined){
            console.error("The function TaskProxy.existTask expects a non null and non undefined task id.")
            return false;
        }

        const allTasks = await this.fetchTasks(equipmentId, true);

        return allTasks.findIndex(task => task._uiId === taskId) !== -1;
    }

    onEquipmentDeleted = async (equipmentId: string): Promise<void> => {
        var tasks = await this.fetchTasks(equipmentId, true);

        await tasks.reduce(async (previousPromise, task) => {
            await previousPromise;
            await storageService.removeItemInArray<TaskModel>(this.baseUrl + equipmentId, task._uiId);
            await entryProxy.onTaskDeleted(equipmentId, task._uiId);
            await imageProxy.onEntityDeleted(task._uiId);
        }, Promise.resolve());
    }
}

const taskProxy:ITaskProxy = new TaskProxy();
export default taskProxy;
