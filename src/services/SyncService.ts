/* eslint-disable max-classes-per-file */

import log from 'loglevel';
import { TaskWithProgress } from './TaskWithProgress';

// eslint-disable-next-line no-unused-vars
import actionManager, { Action } from './ActionManager';
// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';
import onlineManager from './OnlineManager';
import analytics from '../helpers/AnalyticsHelper';

export class SyncServiceException extends Error {}

class SyncService extends TaskWithProgress implements IUserStorageListener {
  constructor() {
    super();
    storageService.registerUserStorageListener(this);
    onlineManager.registerIsOnlineListener(this.onIsOnlineChanged);
    actionManager.registerOnActionManagerChanged(this.onActionManagerChanged);
  }

  onIsOnlineChanged = async (online: boolean): Promise<void> => ((online && storageService.isUserStorageOpened() ? this.tryToRun(false) : Promise.resolve()))

  async onUserStorageOpened(): Promise<void> {
    if ((await onlineManager.isOnline()) === false) {
      return Promise.resolve();
    }

    return this.tryToRun(false);
  }

  onUserStorageClosed = async (): Promise<void> => {}

  onActionManagerChanged = async (nbAction: number) => {
    if (this.taskProgress.isRunning === false) {
      this.taskProgress.total = nbAction;
    }

    this.taskProgress.remaining = nbAction;
    return this.triggerTaskProgressChanged();
  }

  run = async (isUserInteraction: boolean): Promise<void> => {
    if (storageService.isUserStorageOpened() === false) {
      throw new SyncServiceException('storageNotOpenedYet');
    }

    if ((await onlineManager.isOnline()) === false) {
      throw new SyncServiceException('actionErrorBecauseOffline');
    }

    analytics.syncStorage(isUserInteraction);
    return this.syncStorage();
  }

  cancel = () => {
    analytics.cancelSyncStorage();
    actionManager.cancelAction();
  }

  private syncStorage = async (): Promise<void> => {
    this.taskProgress.init(actionManager.countAction());
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
      throw new SyncServiceException('unexpectedError');
    } finally {
      this.taskProgress.isRunning = false;
      await this.triggerTaskProgressChanged();
    }
  }
}

const syncService = new SyncService();

export default syncService as TaskWithProgress;
