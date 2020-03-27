// eslint-disable-next-line no-unused-vars
import { CancelTokenSource } from 'axios';
import log from 'loglevel';
import equipmentManager from './EquipmentManager';

// eslint-disable-next-line no-unused-vars
import { TaskModel, EquipmentModel } from '../types/Types';

import httpProxy from './HttpProxy';

export type CurrentTaskListener = (task: TaskModel|undefined) => void;
export type TasksListener = (tasks: TaskModel[]) => void;

export interface ITaskManager{
    getTask(uiId: string): TaskModel;
    getTasks(): TaskModel[];
    areTasksLoading(): boolean;

    refreshTasks(): void;

    getCurrentTask(): TaskModel | undefined;
    setCurrentTask(task: TaskModel | undefined): void;
    isCurrentTaskChanging(): boolean;

    onTaskDeleted(taskToDelete: TaskModel): void;
    onTaskSaved(taskSaved: TaskModel): void;

    registerOnCurrentTaskChanged(listener: CurrentTaskListener):void;
    unregisterOnCurrentTaskChanged(listenerToRemove: CurrentTaskListener):void;

    registerOnTasksChanged(listener: TasksListener):void;
    unregisterOnTasksChanged(listenerToRemove: TasksListener):void;
}

class TaskManager implements ITaskManager {
    private cancelFetchToken: CancelTokenSource | undefined = undefined;

    private cancelFetch: (() => void) | undefined = undefined;

    private currentTaskListeners: CurrentTaskListener[] = [];

    private tasksListeners: TasksListener[] = [];

    private tasks: TaskModel[] = [];

    private currentTask: TaskModel|undefined = undefined;

    private isCurrentTaskChangingFlag: boolean = false;

    private areTasksLoadingFlag: boolean = false;

    constructor() {
      equipmentManager.registerOnCurrentEquipmentChanged(this.onCurrentEquipmentChanged);
    }

    // eslint-disable-next-line no-unused-vars
    private onCurrentEquipmentChanged = async (currentEquipment: EquipmentModel | undefined) => {
      this.isCurrentTaskChangingFlag = true;
      this.areTasksLoadingFlag = true;

      if (currentEquipment !== undefined) {
        const { default: taskProxy } = await import('./TaskProxy');

        if (this.cancelFetch !== undefined) {
          this.cancelFetch();
        }

        this.cancelFetchToken = httpProxy.createCancelTokenSource();
        this.cancelFetch = () => {
          if (this.cancelFetchToken !== undefined) { this.cancelFetchToken.cancel(`Cancel fetching tasks of equipment ${currentEquipment.name}`); }
        };

        try {
          const tasks = await taskProxy.fetchTasks({ equipmentId: currentEquipment._uiId, cancelToken: this.cancelFetchToken.token });
          this.cancelFetch = undefined;

          this.onTasksChanged(tasks);
        } catch (error) {
          log.warn(error.message);
        }
      } else {
        this.onTasksChanged([]);
      }
    }

    refreshTasks = () => {
      this.onCurrentEquipmentChanged(equipmentManager.getCurrentEquipment());
    }

    getTask = (uiId: string): TaskModel => this.getTasks().filter((task) => task._uiId === uiId)[0]

    getTasks = (): TaskModel[] => this.tasks.concat([])

    areTasksLoading = (): boolean => this.areTasksLoadingFlag

    getCurrentTask = (): TaskModel | undefined => this.currentTask

    setCurrentTask = (task: TaskModel | undefined) => {
      this.currentTask = task;
      this.isCurrentTaskChangingFlag = false;
      this.currentTaskListeners.map((listener) => listener(this.currentTask));
    }

    isCurrentTaskChanging = () => this.isCurrentTaskChangingFlag

    private onTasksChanged = (tasks: TaskModel[], newCurrentTask?: TaskModel): void => {
      this.tasks = tasks;

      this.tasks.sort((taskA, taskB) => {
        if (taskB.level === taskA.level) {
          return taskA.nextDueDate.getTime() - taskB.nextDueDate.getTime();
        }

        return taskB.level - taskA.level;
      });
      this.areTasksLoadingFlag = false;

      this.tasksListeners.map((listener) => listener(this.tasks));

      if (newCurrentTask !== undefined) {
        this.setCurrentTask(newCurrentTask);
      } else if (this.getCurrentTask() === undefined) {
        this.setCurrentTask(this.tasks.length > 0 ? this.tasks[0] : undefined);
      } else {
        const currentTaskIndex = this.tasks.findIndex((eq) => eq._uiId === this.getCurrentTask()?._uiId);
        if (currentTaskIndex === -1) {
          this.setCurrentTask(this.tasks.length > 0 ? this.tasks[0] : undefined);
        } else {
          this.setCurrentTask(this.tasks[currentTaskIndex]);
        }
      }
    }

    onTaskDeleted = (taskToDelete: TaskModel): void => {
      if (taskToDelete._uiId === this.currentTask?._uiId) {
        this.isCurrentTaskChangingFlag = true;
      }

      const newTaskList = this.tasks.filter((taskInfo) => taskInfo._uiId !== taskToDelete._uiId);
      this.onTasksChanged(newTaskList);
    }

    onTaskSaved = (taskSaved: TaskModel): void => {
      const index = this.tasks.findIndex((taskInfo) => taskInfo._uiId === taskSaved._uiId);

      const taskToAddOrUpdate = { ...taskSaved };
      if (index === -1) {
        this.tasks.push(taskToAddOrUpdate);
      } else {
        this.tasks[index] = taskToAddOrUpdate;
      }

      this.onTasksChanged(this.tasks.concat([]), taskToAddOrUpdate);
    }

    registerOnCurrentTaskChanged = (listener: CurrentTaskListener):void => {
      this.currentTaskListeners.push(listener);
    }

    unregisterOnCurrentTaskChanged = (listenerToRemove: CurrentTaskListener):void => {
      this.currentTaskListeners = this.currentTaskListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerOnTasksChanged = (listener: TasksListener):void => {
      this.tasksListeners.push(listener);
    }

    unregisterOnTasksChanged = (listenerToRemove: TasksListener):void => {
      this.tasksListeners = this.tasksListeners.filter((listener) => listener !== listenerToRemove);
    }
}

const taskManager:ITaskManager = new TaskManager();
export default taskManager;
