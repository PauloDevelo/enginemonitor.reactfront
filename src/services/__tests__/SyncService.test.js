// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../testHelpers/MockConsole';

import syncService, { SyncServiceException } from '../SyncService';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import actionManager, { ActionType } from '../ActionManager';
import httpProxy from '../HttpProxy';
import errorService from '../ErrorService';

jest.mock('../HttpProxy');
jest.mock('../OnlineManager');
jest.mock('../ErrorService');

describe('Test SyncService', () => {
  beforeAll(async () => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
    ignoredMessages.push('something happened');
  });

  beforeEach(async () => {
    const user = { email: 'test@gmail.com' };
    await storageService.openUserStorage(user);

    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));

    httpProxy.get.mockImplementation(() => {});
    httpProxy.post.mockImplementation(() => {});
    httpProxy.postImage.mockImplementation(() => {});
    httpProxy.deleteReq.mockImplementation(() => {});
    httpProxy.createCancelTokenSource.mockImplementation(() => ({ token: {} }));

    errorService.addError.mockImplementation(() => {});
  });

  afterEach(async () => {
    onlineManager.isOnline.mockRestore();

    httpProxy.get.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.postImage.mockRestore();
    httpProxy.deleteReq.mockRestore();
    httpProxy.createCancelTokenSource.mockRestore();

    errorService.addError.mockRestore();

    if (storageService.isUserStorageOpened()) {
      await actionManager.clearActions();
    }

    await storageService.closeUserStorage();
  });

  describe('synchronize', () => {
    it('should do nothing if there is no action to sync', async () => {
      // Arrange
      const syncListener = jest.fn();
      syncService.registerListener(syncListener);

      // Act
      await syncService.tryToRun();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(2);
      expect(syncListener.mock.calls[0][0]).toEqual({ isRunning: true, remaining: 0, total: 0 });
      expect(syncListener.mock.calls[1][0]).toEqual({ isRunning: false, remaining: 0, total: 0 });

      syncService.unregisterListener(syncListener);
    });

    it('should do nothing if not online', async () => {
      // Arrange
      onlineManager.isOnline.mockImplementation(async () => Promise.resolve(false));

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
      await actionManager.addAction(action1);
      await actionManager.addAction(action2);

      const syncListener = jest.fn();
      syncService.registerListener(syncListener);

      // Act
      await syncService.tryToRun();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(0);
      expect(actionManager.countAction()).toBe(2);

      expect(errorService.addError).toHaveBeenCalledTimes(1);
      expect(errorService.addError.mock.calls[0][0]).toBeInstanceOf(SyncServiceException);
      expect(errorService.addError.mock.calls[0][0].message).toEqual('actionErrorBecauseOffline');

      syncService.unregisterListener(syncListener);
    });

    it('should do nothing if user storage not opened yet', async () => {
      // Arrange
      await storageService.closeUserStorage();
      onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));

      const syncListener = jest.fn();
      syncService.registerListener(syncListener);

      // Act
      await syncService.tryToRun();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(0);

      expect(errorService.addError).toHaveBeenCalledTimes(1);
      expect(errorService.addError.mock.calls[0][0]).toBeInstanceOf(SyncServiceException);
      expect(errorService.addError.mock.calls[0][0].message).toEqual('storageNotOpenedYet');

      syncService.unregisterListener(syncListener);
    });

    it('should perform the action if there is action pending in the correct order', async () => {
      // Arrange
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
      await actionManager.addAction(action1);
      await actionManager.addAction(action2);

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerListener(syncListener);

      // Act
      await syncService.tryToRun();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isRunning: true, total: 2, remaining: 2 });
      expect(contexts[1]).toEqual({ isRunning: true, total: 2, remaining: 1 });
      expect(contexts[2]).toEqual({ isRunning: true, total: 2, remaining: 0 });
      expect(contexts[3]).toEqual({ isRunning: false, total: 2, remaining: 0 });

      expect(actionManager.countAction()).toBe(0);

      syncService.unregisterListener(syncListener);
    });

    it('should perform the action if there is action pending in the correct order but it should stop when an action fails', async () => {
      // Arrange
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
      await actionManager.addAction(action1);
      await actionManager.addAction(action2);
      await actionManager.addAction(action3);

      httpProxy.post.mockImplementation(async (url) => {
        if (url === 'http://localhost/post/somethingelse') {
          throw new Error('something happened');
        }
        return Promise.resolve({});
      });

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerListener(syncListener);

      // Act
      await syncService.tryToRun();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isRunning: true, total: 3, remaining: 3 });
      expect(contexts[1]).toEqual({ isRunning: true, total: 3, remaining: 2 });
      expect(contexts[2]).toEqual({ isRunning: true, total: 3, remaining: 1 });
      expect(contexts[3]).toEqual({ isRunning: false, total: 3, remaining: 1 });

      expect(actionManager.countAction()).toBe(1);

      syncService.unregisterListener(syncListener);
    });
  });
});
