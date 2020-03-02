import ignoredMessages from '../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService, { SyncContext } from '../SyncService';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import actionManager, { NoActionPendingError, ActionType } from '../ActionManager';
import httpProxy from '../HttpProxy';

jest.mock('../ActionManager');
jest.mock('../HttpProxy');
jest.mock('../OnlineManager');
jest.mock('../StorageService');

describe('Test SyncService', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
    ignoredMessages.push('something wrong happened');
  });

  beforeEach(() => {
    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));
    storageService.isUserStorageOpened.mockImplementation(() => true);
  });

  afterEach(async () => {
    actionManager.getNextActionToPerform.mockRestore();
    actionManager.countAction.mockRestore();
    actionManager.performAction.mockRestore();
    actionManager.putBackAction.mockRestore();

    onlineManager.isOnline.mockRestore();

    storageService.isUserStorageOpened.mockRestore();

    httpProxy.get.mockRestore();
  });

  describe('synchronize', () => {
    it('should do nothing if there is no action to sync', async (done) => {
      // Arrange
      actionManager.countAction.mockImplementation(() => 0);

      actionManager.getNextActionToPerform.mockImplementation(() => {
        throw new NoActionPendingError();
      });

      let syncContext;
      const syncListener = jest.fn().mockImplementation((context) => { syncContext = context; });
      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.synchronize();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(2);
      expect(syncContext).not.toBeUndefined();
      expect(syncContext.isSyncing).toBe(false);
      expect(syncContext.totalActionToSync).toBe(0);
      expect(syncContext.remainingActionToSync).toBe(0);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should do nothing if not online', async (done) => {
      // Arrange
      onlineManager.isOnline.mockImplementation(async () => Promise.resolve(false));
      actionManager.countAction.mockImplementation(() => 2);

      const action1 = {
        type: ActionType.Post,
        key: 'http://localhost/post/something',
        data: 'anything',
      };

      const action2 = {
        type: ActionType.Delete,
        key: 'http://localhost/delete/something',
        data: 'anything',
      };

      const getNextActionToPerform = jest.spyOn(actionManager, 'getNextActionToPerform');
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action1));
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action2));
      getNextActionToPerform.mockImplementationOnce(() => { throw new NoActionPendingError(); });

      const performedActions = [];
      const performAction = jest.spyOn(actionManager, 'performAction');
      performAction.mockImplementation((action) => performedActions.push(action));

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.synchronize();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(0);
      expect(getNextActionToPerform).toBeCalledTimes(0);
      expect(performAction).toBeCalledTimes(0);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should perform the action if there is action pending in the correct order', async (done) => {
      // Arrange
      actionManager.countAction.mockImplementation(() => 2);

      const action1 = {
        type: ActionType.Post,
        key: 'http://localhost/post/something',
        data: 'anything',
      };

      const action2 = {
        type: ActionType.Delete,
        key: 'http://localhost/delete/something',
        data: 'anything',
      };

      const getNextActionToPerform = jest.spyOn(actionManager, 'getNextActionToPerform');
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action1));
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action2));
      getNextActionToPerform.mockImplementationOnce(() => { throw new NoActionPendingError(); });

      const performedActions = [];
      const performAction = jest.spyOn(actionManager, 'performAction');
      performAction.mockImplementation((action) => performedActions.push(action));

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.synchronize();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isSyncing: true, totalActionToSync: 2, remainingActionToSync: 2 });
      expect(contexts[1]).toEqual({ isSyncing: true, totalActionToSync: 2, remainingActionToSync: 1 });
      expect(contexts[2]).toEqual({ isSyncing: true, totalActionToSync: 2, remainingActionToSync: 0 });
      expect(contexts[3]).toEqual({ isSyncing: false, totalActionToSync: 2, remainingActionToSync: 0 });

      expect(getNextActionToPerform).toBeCalledTimes(3);

      expect(performAction).toBeCalledTimes(2);
      expect(performedActions[0]).toBe(action1);
      expect(performedActions[1]).toBe(action2);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should perform the action if there is action pending in the correct order but it should stop when an action fails', async (done) => {
      // Arrange
      actionManager.countAction.mockImplementation(() => 3);

      let actionBack;
      const putBackAction = jest.spyOn(actionManager, 'putBackAction').mockImplementationOnce((action) => { actionBack = action; });

      const action1 = {
        type: ActionType.Post,
        key: 'http://localhost/post/something',
        data: 'anything',
      };

      const action2 = {
        type: ActionType.Delete,
        key: 'http://localhost/delete/something',
        data: 'anything',
      };

      const action3 = {
        type: ActionType.Post,
        key: 'http://localhost/post/somethingelse',
        data: 'anything',
      };

      const getNextActionToPerform = jest.spyOn(actionManager, 'getNextActionToPerform');
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action1));
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action2));
      getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action3));
      getNextActionToPerform.mockImplementationOnce(() => { throw new NoActionPendingError(); });

      const performedActions = [];
      const performAction = jest.spyOn(actionManager, 'performAction');
      performAction.mockImplementationOnce((action) => performedActions.push(action));
      performAction.mockImplementationOnce((action) => performedActions.push(action));
      performAction.mockImplementationOnce(() => { throw new Error('something wrong happened'); });

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.synchronize();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isSyncing: true, totalActionToSync: 3, remainingActionToSync: 3 });
      expect(contexts[1]).toEqual({ isSyncing: true, totalActionToSync: 3, remainingActionToSync: 2 });
      expect(contexts[2]).toEqual({ isSyncing: true, totalActionToSync: 3, remainingActionToSync: 1 });
      expect(contexts[3]).toEqual({ isSyncing: false, totalActionToSync: 3, remainingActionToSync: 1 });

      expect(getNextActionToPerform).toBeCalledTimes(3);

      expect(performAction).toBeCalledTimes(3);
      expect(performedActions[0]).toBe(action1);
      expect(performedActions[1]).toBe(action2);

      expect(putBackAction).toBeCalledTimes(1);
      expect(actionBack).toBe(action3);

      syncService.unregisterSyncListener(syncListener);
      done();
    });
  });
});
