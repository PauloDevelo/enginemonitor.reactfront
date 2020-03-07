export type TaskWithProgressContext = {
  isRunning: boolean;
  total: number;
  remaining: number;
}

function getInitialProgress(): TaskWithProgressContext {
  return {
    isRunning: false,
    total: 0,
    remaining: 0,
  };
}

type TaskWithProgressListener = (context: TaskWithProgressContext) => Promise<void>

export abstract class TaskWithProgress {
  protected readonly taskProgress = getInitialProgress();

  private listeners: (TaskWithProgressListener)[] = [];

  abstract run(): Promise<void>;

  abstract cancel(): void;

  registerSyncListener(listener: TaskWithProgressListener):void{
    this.listeners.push(listener);
  }

  unregisterSyncListener(listenerToRemove: TaskWithProgressListener):void{
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
