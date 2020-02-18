import ignoredMessages from '../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService, { SyncContext } from '../SyncService';
import actionManager, { NoActionPendingError, ActionType } from '../ActionManager';
import httpProxy from '../HttpProxy';

jest.mock('../ActionManager');
jest.mock('../HttpProxy');

describe('Test SyncService', () => {
  let isOnlineGetter;

  beforeEach(() => {
    isOnlineGetter = jest.spyOn(window.navigator, 'onLine', 'get');
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
    ignoredMessages.push('something wrong happened');
  });

  afterEach(async () => {
    isOnlineGetter.mockRestore();
    actionManager.getNextActionToPerform.mockRestore();
    actionManager.countAction.mockRestore();
    actionManager.performAction.mockRestore();
    actionManager.putBackAction.mockRestore();

    httpProxy.get.mockRestore();
  });

  const isOnlineParams = [
    {
      isOnline: true, offlineMode: false, pong: true, expectedIsOnLineResult: true,
    },
    {
      isOnline: true, offlineMode: true, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: false, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: true, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: true, offlineMode: false, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: true, offlineMode: true, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: false, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: true, pong: false, expectedIsOnLineResult: false,
    },
  ];
  describe.each(isOnlineParams)('isOnline', ({
    isOnline, offlineMode, pong, expectedIsOnLineResult,
  }) => {
    it(`When the browser detects internet is ${isOnline}, and offline mode is ${offlineMode} the sync service should return isOnline ${expectedIsOnLineResult}`, async () => {
      // Arrange
      actionManager.getNextActionToPerform.mockImplementation(() => {
        throw new NoActionPendingError();
      });

      isOnlineGetter.mockReturnValue(isOnline);
      syncService.setOfflineMode(offlineMode);
      jest.spyOn(httpProxy, 'get').mockImplementation(async () => Promise.resolve({ pong }));

      // Act
      const isOnlineReturned = await syncService.isOnline();

      // Assert
      expect(isOnlineReturned).toBe(expectedIsOnLineResult);
    });
  });

  const isSyncedParams = [
    { nbAction: 0, expectedIsSynced: true },
    { nbAction: 15, expectedIsSynced: false },
  ];
  describe.each(isSyncedParams)('isSynced', ({ nbAction, expectedIsSynced }) => {
    it(`When the action manager has ${nbAction} to sync, isSynced should be ${expectedIsSynced}`, async () => {
      // Arrange
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(nbAction));

      // Act
      const isSyncedReturned = await syncService.isSynced();

      // Assert
      expect(isSyncedReturned).toBe(expectedIsSynced);
    });
  });

  const isOnlineAndSyncedParams = [
    {
      isOnline: true, offlineMode: false, nbAction: 0, expectedIsOnLineAndSyncedResult: true,
    },
    {
      isOnline: true, offlineMode: true, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: false, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: true, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: true, offlineMode: false, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: true, offlineMode: true, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: false, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: true, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
  ];
  describe.each(isOnlineAndSyncedParams)('isOnlineAndSynced', ({
    isOnline, offlineMode, nbAction, expectedIsOnLineAndSyncedResult,
  }) => {
    it(`When the browser detects internet is ${isOnline}, and offline mode is ${offlineMode} and the action manager has ${nbAction} to sync, the sync service should return isOnlineAndSync to be ${expectedIsOnLineAndSyncedResult}`, async () => {
      // Arrange
      jest.spyOn(actionManager, 'getNextActionToPerform').mockImplementation(() => {
        throw new NoActionPendingError();
      });
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(nbAction));

      isOnlineGetter.mockReturnValue(isOnline);
      syncService.setOfflineMode(offlineMode);

      jest.spyOn(httpProxy, 'get').mockImplementation(async () => Promise.resolve({ pong: true }));

      // Act
      const isOnlineAndSyncedReturned = await syncService.isOnlineAndSynced();

      // Assert
      expect(isOnlineAndSyncedReturned).toBe(expectedIsOnLineAndSyncedResult);
    });
  });

  describe('synchronize', () => {
    it('should do nothing if there is no action to sync', async (done) => {
      // Arrange
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(0));

      jest.spyOn(actionManager, 'getNextActionToPerform').mockImplementation(() => {
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

    it('should perform the action if there is action pending in the correct order', async (done) => {
      // Arrange
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(2));

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
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(3));

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
