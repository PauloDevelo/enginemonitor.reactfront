/* eslint-disable max-classes-per-file */
import log from 'loglevel';
import errorService from './ErrorService';

// eslint-disable-next-line max-classes-per-file
export interface ITaskWithProgressContext{
  isRunning: boolean;
  total: number;
  remaining: number;
}

class TaskWithProgressContext implements ITaskWithProgressContext {
  isRunning: boolean = false;

  total: number = 0;

  remaining: number = 0;

  init(nbEntities: number) {
    this.total = nbEntities;
    this.remaining = nbEntities;
    this.isRunning = true;
  }

  addEntities(nbEntities: number) {
    this.total += nbEntities;
    this.remaining += nbEntities;
  }

  decremente() {
    this.remaining--;
  }
}

type TaskWithProgressListener = (context: ITaskWithProgressContext) => Promise<void>

export abstract class TaskWithProgress {
  protected readonly taskProgress = new TaskWithProgressContext();

  private listeners: (TaskWithProgressListener)[] = [];

  async tryToRun(): Promise<void> {
    try {
      await this.run();
    } catch (error) {
      errorService.addError(error);
    }

    return Promise.resolve();
  }

  protected abstract run(): Promise<void>;

  abstract cancel(): void;

  registerListener(listener: TaskWithProgressListener):void{
    this.listeners.push(listener);
  }

  unregisterListener(listenerToRemove: TaskWithProgressListener):void{
    this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
  }

  protected async triggerTaskProgressChanged(): Promise<void> {
    const promises = this.listeners.map((listener) => listener({ ...this.taskProgress }));
    await Promise.all(promises);
  }

  getContext() {
    return { ...this.taskProgress };
  }
}
