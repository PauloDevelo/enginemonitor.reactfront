import * as log from 'loglevel';
// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import entryProxy from './EntryProxy';
import imageProxy from './ImageProxy';

import storageService from './StorageService';

import { updateTask, updateRealtimeFields } from '../helpers/TaskHelper';
// eslint-disable-next-line no-unused-vars
import { TaskModel, AssetModel } from '../types/Types';

import assetManager from './AssetManager';
import HttpError from '../http/HttpError';

export interface FetchTaskProps{
    equipmentId: string | undefined;
    cancelToken?: CancelToken | undefined;
    forceToLookUpInStorage?: boolean;
    cancelTimeout?: boolean;
}

export interface ITaskProxy{
    createOrSaveTask(equipmentId: string, newTask: TaskModel):Promise<TaskModel>;
    deleteTask(equipmentId: string, taskId: string): Promise<TaskModel>;
    fetchTasks(props: FetchTaskProps): Promise<TaskModel[]>;

    existTask(equipmentId: string | undefined, taskId: string | undefined):Promise<boolean>;

    onEquipmentDeleted(equipmentId: string): Promise<void>;
}

class TaskProxy implements ITaskProxy {
    private baseUrl:string = `${process.env.REACT_APP_API_URL_BASE}tasks/${undefined}`;

    constructor() {
      assetManager.registerOnCurrentAssetChanged(this.updateBaseUrl);
    }

    updateBaseUrl = (asset: AssetModel | undefined | null) => {
      this.baseUrl = `${process.env.REACT_APP_API_URL_BASE}tasks/${asset?._uiId}/`;
    }

    // ///////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: TaskModel):Promise<TaskModel> => {
      if (await this.existTask(equipmentId, newTask._uiId) === false) {
        const tasks = await this.fetchTasks({ equipmentId, forceToLookUpInStorage: true });
        if (tasks.findIndex((task) => task.name === newTask.name) !== -1) {
          throw new HttpError({ name: 'alreadyexisting' });
        }
      }

      const updatedTask = await progressiveHttpProxy.postAndUpdate<TaskModel>(`${this.baseUrl + equipmentId}/${newTask._uiId}`, 'task', newTask, updateTask);

      await storageService.updateArray(this.baseUrl + equipmentId, updatedTask);

      return updatedTask;
    }

    deleteTask = async (equipmentId: string, taskId: string): Promise<TaskModel> => {
      await progressiveHttpProxy.delete<TaskModel>(`${this.baseUrl + equipmentId}/${taskId}`);

      const removedTask = await storageService.removeItemInArray<TaskModel>(this.baseUrl + equipmentId, taskId);
      await entryProxy.onTaskDeleted(equipmentId, taskId);
      await imageProxy.onEntityDeleted(taskId);

      return updateTask(removedTask);
    }

    fetchTasks = async ({
      equipmentId, forceToLookUpInStorage = false, cancelToken = undefined, cancelTimeout = false,
    } :FetchTaskProps): Promise<TaskModel[]> => {
      if (equipmentId === undefined) {
        return [];
      }

      if (forceToLookUpInStorage) {
        return progressiveHttpProxy.getArrayFromStorage({ url: this.baseUrl + equipmentId, init: updateTask });
      }

      const tasks:TaskModel[] = await progressiveHttpProxy.getArrayOnlineFirst({
        url: this.baseUrl + equipmentId, keyName: 'tasks', init: updateTask, cancelToken, cancelTimeout,
      });
      return Promise.all(tasks.map(async (task) => updateRealtimeFields(equipmentId, task)));
    }

    existTask = async (equipmentId: string | undefined, taskId: string | undefined):Promise<boolean> => {
      if (equipmentId === undefined || taskId === undefined) {
        log.error('The function TaskProxy.existTask expects a non null and non undefined task id.');
        return false;
      }

      const allTasks = await this.fetchTasks({ equipmentId, forceToLookUpInStorage: true });

      return allTasks.findIndex((task) => task._uiId === taskId) !== -1;
    }

    onEquipmentDeleted = async (equipmentId: string): Promise<void> => {
      const tasks = await this.fetchTasks({ equipmentId, forceToLookUpInStorage: true });

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
