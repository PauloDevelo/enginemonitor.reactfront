import log from 'loglevel';
import { TaskWithProgress } from './TaskWithProgress';

// eslint-disable-next-line no-unused-vars
import actionManager, { Action } from './ActionManager';
// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';
import onlineManager from './OnlineManager';

class SyncService extends TaskWithProgress implements IUserStorageListener {
  constructor() {
    super();
    storageService.registerUserStorageListener(this);
    onlineManager.registerIsOnlineListener(this.onIsOnlineChanged);
    actionManager.registerOnActionManagerChanged(this.onActionManagerChanged);

    this.run();
  }

  onIsOnlineChanged = async (online: boolean): Promise<void> => (online ? this.run() : Promise.resolve())

  async onUserStorageOpened(): Promise<void> {
    return this.run();
  }

  onUserStorageClosed = async (): Promise<void> => {}

  onActionManagerChanged = async (nbAction: number) => {
    if (this.taskProgress.isRunning === false) {
      this.taskProgress.total = nbAction;
    }

    this.taskProgress.remaining = nbAction;
    return this.triggerTaskProgressChanged();
  }

  run = async (): Promise<void> => {
    if (storageService.isUserStorageOpened() === false) {
      return Promise.resolve();
    }

    if ((await onlineManager.isOnline()) === false) {
      return Promise.resolve();
    }

    return this.syncStorage();
  }

  cancel = () => {
    actionManager.cancelAction();
  }

  private syncStorage = async (): Promise<void> => {
    this.taskProgress.isRunning = true;
    this.taskProgress.total = actionManager.countAction();
    this.taskProgress.remaining = this.taskProgress.total;
    await this.triggerTaskProgressChanged();

    try {
      while (actionManager.countAction() > 0) {
        const action: Action = actionManager.getNextActionToPerform();

        // eslint-disable-next-line no-await-in-loop
        await actionManager.performAction(action);
        // eslint-disable-next-line no-await-in-loop
        await actionManager.shiftAction();
      }
    } catch (error) {
      log.error(error);
    }

    this.taskProgress.isRunning = false;
    await this.triggerTaskProgressChanged();

    return Promise.resolve();
  }
}

const syncService = new SyncService();

export default syncService as TaskWithProgress;
