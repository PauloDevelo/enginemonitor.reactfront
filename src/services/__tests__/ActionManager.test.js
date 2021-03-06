import axios from 'axios';
import localforage from 'localforage';
import ignoredMessages from '../../testHelpers/MockConsole';


import httpProxy from '../HttpProxy';
import storageService from '../StorageService';

import actionManager, { NoActionPendingError, ActionType } from '../ActionManager';
import HttpError from '../../http/HttpError';

import { base64ToBlob, blobToDataURL } from '../../helpers/ImageHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test ActionManager', () => {
  const listener = jest.fn();

  const thumbnail = base64ToBlob('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', 'image/jpeg');
  const imageData = base64ToBlob('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', 'image/jpeg');

  const actionToAdd1 = {
    type: ActionType.Post,
    key: 'my_action_test_01',
    data: { name: 'data1' },
  };

  const actionToAdd2 = {
    type: ActionType.Post,
    key: 'my_action_test_02',
    data: undefined,
  };

  function clearMockHttpProxy() {
    httpProxy.setConfig.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.postImage.mockRestore();
    httpProxy.deleteReq.mockRestore();
    httpProxy.createCancelTokenSource.mockRestore();
  }

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('It seems like they have been deleted in a further delete action');
  });

  beforeEach(async () => {
    httpProxy.createCancelTokenSource.mockImplementation(() => axios.CancelToken.source());

    const user = { email: 'test@gmail.com' };
    await storageService.openUserStorage(user);

    storageService.getUserStorage().keys = jest.fn(async () => Promise.resolve(['history', 'my_thumbnail_url', 'my_image_url']));

    actionManager.registerOnActionManagerChanged(listener);
  });

  afterEach(async () => {
    actionManager.unregisterOnActionManagerChanged(listener);
    listener.mockReset();

    await actionManager.clearActions();
    await storageService.removeItem('my_thumbnail_url');
    await storageService.removeItem('my_image_url');


    clearMockHttpProxy();
  });

  describe('addAction', () => {
    it('when adding 2 actions, we should get 2 actions in the action list.', async (done) => {
      // Arrange

      // Act
      await actionManager.addAction(actionToAdd1);
      await actionManager.addAction(actionToAdd2);

      // Assert
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0]).toEqual(1);
      expect(listener.mock.calls[1][0]).toEqual(2);

      expect(actionManager.countAction()).toBe(2);
      done();
    });
  });

  describe('getNextActionToPerform', () => {
    it('When adding 2 actions, getNextActionToPerform should return the first added action.', async (done) => {
      // Arrange
      await actionManager.addAction(actionToAdd1);
      await actionManager.addAction(actionToAdd2);
      listener.mockReset();

      // Act
      const nextAction = await actionManager.getNextActionToPerform();

      // Assert
      expect(listener).toHaveBeenCalledTimes(0);

      expect(nextAction).toEqual(actionToAdd1);

      const actions = await storageService.getArray('history');
      expect(actions.length).toBe(2);
      expect(actions[0]).toEqual(actionToAdd1);
      expect(actions[1]).toEqual(actionToAdd2);
      done();
    });

    it('When there is no action to perform, getNextActionToPerform should throw an exception.', async (done) => {
      try {
        // Arrange

        // Act
        await actionManager.getNextActionToPerform();
      } catch (ex) {
        expect(listener).toHaveBeenCalledTimes(0);
        expect(ex).toBeInstanceOf(NoActionPendingError);
        expect(ex.message).toEqual("There isn't pending action anymore");
        done();
      }
    });
  });

  describe('shifAction', () => {
    it('Should remove the first action', async () => {
      // Arrange
      await actionManager.addAction(actionToAdd1);
      await actionManager.addAction(actionToAdd2);

      listener.mockReset();

      // Act
      await actionManager.shiftAction();

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);

      expect(actionManager.countAction()).toBe(1);

      const actions = await storageService.getArray('history');
      expect(actions.length).toBe(1);
      expect(actions[0]).toEqual(actionToAdd2);
    });

    it('Should remove the first action', async () => {
      // Arrange
      await actionManager.addAction(actionToAdd1);
      listener.mockReset();

      // Act
      await actionManager.shiftAction();

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);

      expect(actionManager.countAction()).toBe(0);

      const actions = await storageService.getArray('history');
      expect(actions.length).toBe(0);
    });

    it('Should throw a NoActionPending exception', async (done) => {
      // Arrange
      listener.mockReset();

      try {
        // Act
        await actionManager.shiftAction();
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NoActionPendingError);
        expect(error.message).toEqual("There isn't pending action anymore");

        expect(listener).toHaveBeenCalledTimes(0);

        expect(actionManager.countAction()).toBe(0);

        const actions = await storageService.getArray('history');
        expect(actions.length).toBe(0);
        done();
      }
    });
  });

  describe('countAction', () => {
    it('when there is no action should return 0', async () => {
      // Arrange
      // Act
      const nbAction = actionManager.countAction();

      // Assert
      expect(nbAction).toBe(0);
    });

    it('when there are 2 actions should return 2', async () => {
      // Arrange
      await actionManager.addAction(actionToAdd1);
      await actionManager.addAction(actionToAdd2);

      // Act
      const nbAction = actionManager.countAction();

      // Assert
      expect(nbAction).toBe(2);
    });

    it('when the user storage gets closed, it should return 0', async () => {
      // Arrange
      await actionManager.addAction(actionToAdd1);
      await actionManager.addAction(actionToAdd2);

      actionManager.onUserStorageClosed();

      // Act
      const nbAction = actionManager.countAction();

      // Assert
      expect(nbAction).toBe(0);
    });
  });

  describe('performAction', () => {
    beforeEach(() => {

    });

    it('when performing a post action, it should call the httpProxy.post function with the correct params', async () => {
      // Arrange
      const urls = [];
      const datas = [];
      httpProxy.post.mockImplementation((url, data) => {
        urls.push(url);
        datas.push(data);
        return Promise.resolve(data);
      });

      httpProxy.deleteReq.mockImplementation(() => ({}));

      // Act
      await actionManager.performAction(actionToAdd1);

      // Assert
      expect(urls.length).toBe(1);
      expect(urls[0]).toBe(actionToAdd1.key);
      expect(datas[0]).toEqual(actionToAdd1.data);
      expect(httpProxy.deleteReq).toHaveBeenCalledTimes(0);
      expect(httpProxy.post.mock.calls[0][2].timeout).toBeUndefined();
    });

    it('when performing a failing post action it should bubble up', async (done) => {
      // Arrange
      httpProxy.post.mockImplementation(async () => {
        throw new Error('unexpected error');
      });

      // Act
      try {
        await actionManager.performAction(actionToAdd1);
      } catch (error) {
        // Assert
        expect(error.message).toEqual('unexpected error');
        done();
      }
    });

    it('when performing a delete action, it should call the httpProxy.delete function with the correct params', async () => {
      // Arrange
      const urls = [];
      const datas = [];
      httpProxy.post.mockImplementation((url, data) => {
        urls.push(url);
        datas.push(data);
        return Promise.resolve(data);
      });

      const deleteUrls = [];
      httpProxy.deleteReq.mockImplementation((url) => {
        deleteUrls.push(url);
        return Promise.resolve({ entry: { name: 'an entry name' } });
      });

      const actionToDelete = {
        type: ActionType.Delete,
        key: 'my_action_test_01',
      };

      // Act
      await actionManager.performAction(actionToDelete);

      // Assert
      expect(urls.length).toBe(0);
      expect(deleteUrls.length).toBe(1);
      expect(deleteUrls[0]).toBe(actionToDelete.key);
      expect(httpProxy.deleteReq.mock.calls[0][1].timeout).toBeUndefined();
    });

    it('when performing a delete action that fails with a HTTPError notfound, it should catch the error and keep proceeding with the synchronisation', async () => {
      // Arrange
      const urls = [];
      const datas = [];
      httpProxy.post.mockImplementation((url, data) => {
        urls.push(url);
        datas.push(data);
        return Promise.resolve(data);
      });

      httpProxy.deleteReq.mockImplementation(async (url) => {
        if (url === 'my_action_test_01') {
          throw new HttpError({ entity: 'notfound' });
        }

        throw new Error(`Unexpected url ${url}`);
      });

      const actionToDelete = {
        type: ActionType.Delete,
        key: 'my_action_test_01',
      };

      // Act
      await actionManager.performAction(actionToDelete);

      // Assert
      expect(httpProxy.deleteReq).toBeCalledTimes(1);
    });

    it('when performing a delete action that fails the exception should bubble up', async (done) => {
      // Arrange
      httpProxy.deleteReq.mockImplementation(async () => {
        throw new Error('Unexpected exception');
      });

      const actionToDelete = {
        type: ActionType.Delete,
        key: 'my_action_test_01',
      };

      // Act
      try {
        await actionManager.performAction(actionToDelete);
      } catch (error) {
        // Assert
        expect(error.message).toEqual('Unexpected exception');
        done();
      }
    });

    it('when performing a create image action, it should call the httpProxy.postImage function with the correct params', async (done) => {
      // Arrange
      httpProxy.postImage.mockImplementation(async () => {});

      const thumbnailDataUrl = await blobToDataURL(thumbnail);
      const imageDataUrl = await blobToDataURL(imageData);

      const actionToCreateImage = {
        type: ActionType.CreateImage,
        key: 'my_action_test_01',
        data: {
          _uiId: 'image_uiid',
          name: 'image title',
          url: 'my_image_url',
          thumbnailUrl: 'my_thumbnail_url',
          parentUiId: 'parentUrl',
          title: 'my image',
          description: 'image description',
          sizeInByte: 1234,
        },
      };

      await storageService.setItem('my_thumbnail_url', thumbnailDataUrl);
      await storageService.setItem('my_image_url', imageDataUrl);

      // Act
      await actionManager.performAction(actionToCreateImage);

      // Assert
      expect(httpProxy.postImage).toBeCalledTimes(1);
      expect(httpProxy.postImage.mock.calls[0][0]).toEqual(actionToCreateImage.key);
      expect(httpProxy.postImage.mock.calls[0][1]).toEqual(actionToCreateImage.data);
      expect(httpProxy.postImage.mock.calls[0][4].timeout).toBeUndefined();
      done();
    });

    it('when performing a failing create image action, the exception should bubble up', async (done) => {
      // Arrange
      httpProxy.postImage.mockImplementation(async () => {
        throw new Error('Unexpected error');
      });
      httpProxy.createCancelTokenSource.mockImplementation(() => ({ token: {} }));

      const actionToCreateImage = {
        type: ActionType.CreateImage,
        key: 'my_action_test_01',
        data: {
          _uiId: 'image_uiid',
          name: 'image title',
          url: 'my_image_url',
          thumbnailUrl: 'my_thumbnail_url',
          parentUiId: 'parentUrl',
          title: 'my image',
          description: 'image description',
          sizeInByte: 1234,
        },
      };

      const thumbnailDataUrl = await blobToDataURL(thumbnail);
      const imageDataUrl = await blobToDataURL(imageData);

      await storageService.setItem('my_thumbnail_url', thumbnailDataUrl);
      await storageService.setItem('my_image_url', imageDataUrl);

      // Act
      try {
        await actionManager.performAction(actionToCreateImage);
      } catch (error) {
        // Assert
        expect(error.message).toEqual('Unexpected error');
        done();
      }
    });

    it('when performing a create image action although the urls are not in the storage anymore, it should not call the httpProxy.postImage function', async (done) => {
      // Arrange
      jest.spyOn(httpProxy, 'postImage');
      httpProxy.createCancelTokenSource.mockImplementation(() => ({ token: {} }));

      const actionToCreateImage = {
        type: ActionType.CreateImage,
        key: 'my_action_test_01',
        data: {
          _uiId: 'image_uiid',
          name: 'image title',
          url: 'my_image_url',
          thumbnailUrl: 'my_thumbnail_url',
          parentUiId: 'parentUrl',
          title: 'my image',
          description: 'image description',
          sizeInByte: 1234,
        },
      };

      // Act
      await actionManager.performAction(actionToCreateImage);

      // Assert
      expect(httpProxy.postImage).toBeCalledTimes(0);
      done();
    });

    it('when performing a unknown action, it should not call any httpProxy function but throw an exception', async (done) => {
      // Arrange
      jest.spyOn(httpProxy, 'post');
      jest.spyOn(httpProxy, 'deleteReq');
      jest.spyOn(httpProxy, 'postImage');

      const unknownActionToAdd = {
        type: 99,
        key: 'my_action_test_01',
        data: { name: 'data1' },
      };

      // Act
      try {
        await actionManager.performAction(unknownActionToAdd);
      } catch (error) {
        // Assert
        expect(httpProxy.post).toHaveBeenCalledTimes(0);
        expect(httpProxy.deleteReq).toHaveBeenCalledTimes(0);
        expect(httpProxy.postImage).toHaveBeenCalledTimes(0);
        done();
      }
    });
  });

  describe('Cancel action', () => {
    it('should be without consequence to cancel although no action performed', async (done) => {
      // Arrange

      // Act
      actionManager.cancelAction();

      // Assert
      done();
    });

    it('should be without consequence to cancel the action after the action performed', async (done) => {
      // Arrange
      const action = {
        type: ActionType.Post,
        key: 'https://postman-echo.com/post',
        data: { name: 'data1' },
      };

      await actionManager.performAction(action);

      // Act
      actionManager.cancelAction();

      // Assert
      done();
    });
  });
});
