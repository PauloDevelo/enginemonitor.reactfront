import equipmentManager from './EquipmentManager';

// eslint-disable-next-line no-unused-vars
import { TaskModel, EquipmentModel } from '../types/Types';

export type CurrentTaskListener = (task: TaskModel|undefined) => void;
export type TasksListener = (tasks: TaskModel[]) => void;

export interface ITaskManager{
    getTasks(): TaskModel[];

    refreshTasks(): void;

    getCurrentTask(): TaskModel | undefined;
    setCurrentTask(task: TaskModel | undefined): void;

    onTaskDeleted(taskToDelete: TaskModel): void;
    onTaskSaved(taskSaved: TaskModel): void;

    registerOnCurrentTaskChanged(listener: CurrentTaskListener):void;
    unregisterOnCurrentTaskChanged(listenerToRemove: CurrentTaskListener):void;

    registerOnTasksChanged(listener: TasksListener):void;
    unregisterOnTasksChanged(listenerToRemove: TasksListener):void;
}

class TaskManager implements ITaskManager {
    private currentTaskListeners: CurrentTaskListener[] = [];

    private tasksListeners: TasksListener[] = [];

    private tasks: TaskModel[] = [];

    private currentTask: TaskModel|undefined = undefined;

    constructor() {
      equipmentManager.registerOnCurrentEquipmentChanged(this.onCurrentEquipmentChanged);
    }

    // eslint-disable-next-line no-unused-vars
    private onCurrentEquipmentChanged = async (currentEquipment: EquipmentModel | undefined) => {
      if (currentEquipment !== undefined) {
        const { default: taskProxy } = await import('./TaskProxy');
        this.onTasksChanged(await taskProxy.fetchTasks({ equipmentId: currentEquipment._uiId }));
      } else {
        this.onTasksChanged([]);
      }
    }

    refreshTasks = () => {
      this.onCurrentEquipmentChanged(equipmentManager.getCurrentEquipment());
    }

    getTasks = (): TaskModel[] => this.tasks.concat([])

    getCurrentTask = (): TaskModel | undefined => this.currentTask

    setCurrentTask = (task: TaskModel | undefined) => {
      this.currentTask = task;
      this.currentTaskListeners.map((listener) => listener(this.currentTask));
    }

    private onTasksChanged = (tasks: TaskModel[], newCurrentTask?: TaskModel): void => {
      this.tasks = tasks;

      this.tasks.sort((taskA, taskB) => {
        if (taskB.level === taskA.level) {
          return taskA.nextDueDate.getTime() - taskB.nextDueDate.getTime();
        }

        return taskB.level - taskA.level;
      });

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
