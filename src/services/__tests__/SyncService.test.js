
// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../testHelpers/MockConsole';

import syncService from '../SyncService';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import actionManager, { ActionType } from '../ActionManager';
import httpProxy from '../HttpProxy';

jest.mock('../HttpProxy');
jest.mock('../OnlineManager');

describe('Test SyncService', () => {
  beforeAll(async () => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
    ignoredMessages.push('something happened');

    const user = { email: 'test@gmail.com' };
    await storageService.openUserStorage(user);
  });

  beforeEach(async () => {
    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));

    httpProxy.get.mockImplementation(() => {});
    httpProxy.post.mockImplementation(() => {});
    httpProxy.postImage.mockImplementation(() => {});
    httpProxy.deleteReq.mockImplementation(() => {});
    httpProxy.createCancelTokenSource.mockImplementation(() => ({ token: {} }));
  });

  afterEach(async () => {
    onlineManager.isOnline.mockRestore();

    httpProxy.get.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.postImage.mockRestore();
    httpProxy.deleteReq.mockRestore();
    httpProxy.createCancelTokenSource.mockRestore();

    await actionManager.clearActions();
  });

  describe('synchronize', () => {
    it('should do nothing if there is no action to sync', async (done) => {
      // Arrange
      let syncContext;
      const syncListener = jest.fn().mockImplementation((context) => { syncContext = context; });
      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.run();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(2);
      expect(syncContext).not.toBeUndefined();
      expect(syncContext.isRunning).toBe(false);
      expect(syncContext.total).toBe(0);
      expect(syncContext.remaining).toBe(0);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should do nothing if not online', async (done) => {
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

      const contexts = [];
      const syncListener = jest.fn();
      syncListener.mockImplementation((context) => {
        contexts.push(context);
      });

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.run();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(0);
      expect(actionManager.countAction()).toBe(2);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should perform the action if there is action pending in the correct order', async (done) => {
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

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.run();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isRunning: true, total: 2, remaining: 2 });
      expect(contexts[1]).toEqual({ isRunning: true, total: 2, remaining: 1 });
      expect(contexts[2]).toEqual({ isRunning: true, total: 2, remaining: 0 });
      expect(contexts[3]).toEqual({ isRunning: false, total: 2, remaining: 0 });

      expect(actionManager.countAction()).toBe(0);

      syncService.unregisterSyncListener(syncListener);
      done();
    });

    it('should perform the action if there is action pending in the correct order but it should stop when an action fails', async (done) => {
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

      syncService.registerSyncListener(syncListener);

      // Act
      await syncService.run();

      // Assert
      expect(syncListener).toHaveBeenCalledTimes(4);

      expect(contexts[0]).toEqual({ isRunning: true, total: 3, remaining: 3 });
      expect(contexts[1]).toEqual({ isRunning: true, total: 3, remaining: 2 });
      expect(contexts[2]).toEqual({ isRunning: true, total: 3, remaining: 1 });
      expect(contexts[3]).toEqual({ isRunning: false, total: 3, remaining: 1 });

      expect(actionManager.countAction()).toBe(1);

      syncService.unregisterSyncListener(syncListener);
      done();
    });
  });
});
