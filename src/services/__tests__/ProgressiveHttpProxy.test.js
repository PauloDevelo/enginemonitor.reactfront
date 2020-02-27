import HttpError from '../../http/HttpError';
import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import syncService from '../SyncService';
import actionManager, { ActionType } from '../ActionManager';
import assetManager from '../AssetManager';

import progressiveHttpProxy from '../ProgressiveHttpProxy';

jest.mock('../HttpProxy');
jest.mock('../StorageService');
jest.mock('../SyncService');
jest.mock('../ActionManager');
jest.mock('../AssetManager');

describe('Test ProgressiveHttpProxy', () => {
  function resetMockHttpProxy() {
    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.deleteReq.mockReset();
    httpProxy.get.mockReset();
    httpProxy.postImage.mockReset();
  }

  function resetMockStorageService() {
    storageService.setItem.mockReset();
    storageService.removeItem.mockReset();
    storageService.updateArray.mockReset();
    storageService.removeItemInArray.mockReset();
    storageService.getArray.mockReset();
    storageService.getItem.mockReset();
  }

  function resetMockSyncService() {
    syncService.isOnlineAndSynced.mockReset();
  }

  function resetMockActionManager() {
    actionManager.addAction.mockReset();
  }

  beforeEach(() => {
    assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
  });

  afterEach(async () => {
    resetMockHttpProxy();
    resetMockStorageService();
    resetMockSyncService();
    resetMockActionManager();
    assetManager.getUserCredentials.mockRestore();
  });

  const postAndUpdateItems = [
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: true, keyname: 'keyname', addActionNbCall: 0, expectedHttpPostCall: 1,
    },
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: false, keyname: 'keyname', addActionNbCall: 1, expectedHttpPostCall: 0,
    },
    {
      throwAnHttpConnAborted: true, isOnlineAndSync: true, keyname: 'keyname', addActionNbCall: 1, expectedHttpPostCall: 1,
    },
  ];
  describe.each(postAndUpdateItems)('postAndUpdate', ({
    throwAnHttpConnAborted, isOnlineAndSync, keyname, addActionNbCall, expectedHttpPostCall,
  }) => {
    it('shoud call the http proxy or add the expected action in action manager', async () => {
      // Arrange
      const dataToPost = { data: 'some data' };
      const urlToPost = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'post').mockImplementation(async (url, data) => {
        if (throwAnHttpConnAborted) {
          const axiosError = new Error('timeout');
          axiosError.code = 'ECONNABORTED';

          throw new HttpError(axiosError.message, axiosError);
        }

        return Promise.resolve(data);
      });

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(actionManager, 'addAction');

      // Act
      const dataPosted = await progressiveHttpProxy.postAndUpdate(urlToPost, keyname, dataToPost, updateFn);

      // Assert
      expect(dataPosted).toStrictEqual(dataToPost);

      expect(httpProxy.post).toBeCalledTimes(expectedHttpPostCall);
      if (expectedHttpPostCall > 0) {
        expect(httpProxy.post.mock.calls[0][0]).toStrictEqual(urlToPost);
        expect(httpProxy.post.mock.calls[0][1][keyname]).toStrictEqual(dataToPost);
      }

      expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
      if (addActionNbCall > 0) {
        expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(urlToPost);
        expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.Post);
        expect(actionManager.addAction.mock.calls[0][0].data[keyname]).toStrictEqual(dataToPost);
      }
    });
  });

  const deleteAndUpdateItems = [
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: true, keyname: 'keyname', addActionNbCall: 0, expectedHttpDeleteCall: 1,
    },
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: false, keyname: 'keyname', addActionNbCall: 1, expectedHttpDeleteCall: 0,
    },
    {
      throwAnHttpConnAborted: true, isOnlineAndSync: true, keyname: 'keyname', addActionNbCall: 1, expectedHttpDeleteCall: 1,
    },
  ];
  describe.each(deleteAndUpdateItems)('deleteAndUpdate', ({
    throwAnHttpConnAborted, isOnlineAndSync, keyname, addActionNbCall, expectedHttpDeleteCall,
  }) => {
    it('shoud call the http proxy or add the expected action in action manager', async () => {
      // Arrange
      const dataToDelete = { data: 'some data' };
      const urlToDelete = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'deleteReq').mockImplementation(async () => {
        if (throwAnHttpConnAborted) {
          const axiosError = new Error('timeout');
          axiosError.code = 'ECONNABORTED';

          throw new HttpError(axiosError.message, axiosError);
        }

        const dataToReturn = {};
        dataToReturn[keyname] = dataToDelete;
        return Promise.resolve(dataToReturn);
      });

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(actionManager, 'addAction');

      // Act
      await progressiveHttpProxy.deleteAndUpdate(urlToDelete, keyname, updateFn);

      // Assert
      expect(httpProxy.deleteReq).toBeCalledTimes(expectedHttpDeleteCall);
      if (expectedHttpDeleteCall > 0) {
        expect(httpProxy.deleteReq.mock.calls[0][0]).toStrictEqual(urlToDelete);
      }

      expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
      if (addActionNbCall > 0) {
        expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(urlToDelete);
        expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.Delete);
      }
    });
  });

  const getItemOnlineFirstItems = [
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: true, keyname: 'keyname', expectedGetItemCall: 0, expectedHttpGetCall: 1, expectedSetItemCall: 1,
    },
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: false, keyname: 'keyname', expectedGetItemCall: 1, expectedHttpGetCall: 0, expectedSetItemCall: 0,
    },
    {
      throwAnHttpConnAborted: true, isOnlineAndSync: true, keyname: 'keyname', expectedGetItemCall: 1, expectedHttpGetCall: 1, expectedSetItemCall: 0,
    },
  ];
  describe.each(getItemOnlineFirstItems)('getOnlineFirst', ({
    throwAnHttpConnAborted, isOnlineAndSync, keyname, expectedGetItemCall, expectedHttpGetCall, expectedSetItemCall,
  }) => {
    it('shoud call the http proxy or call the storageService', async () => {
      // Arrange
      const dataToGet = { data: 'some data' };
      const urlToGet = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'get').mockImplementation(async () => {
        if (throwAnHttpConnAborted) {
          const axiosError = new Error('timeout');
          axiosError.code = 'ECONNABORTED';

          throw new HttpError(axiosError.message, axiosError);
        }

        const dataToReturn = {};
        dataToReturn[keyname] = dataToGet;
        return Promise.resolve(dataToReturn);
      });

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(storageService, 'getItem').mockImplementation(async () => Promise.resolve(dataToGet));
      jest.spyOn(storageService, 'setItem');

      // Act
      const data = await progressiveHttpProxy.getOnlineFirst(urlToGet, keyname, updateFn);

      // Assert
      expect(data).toStrictEqual(dataToGet);

      expect(httpProxy.get).toBeCalledTimes(expectedHttpGetCall);
      if (expectedHttpGetCall > 0) {
        expect(httpProxy.get.mock.calls[0][0]).toStrictEqual(urlToGet);
      }

      expect(storageService.setItem).toBeCalledTimes(expectedSetItemCall);
      if (expectedSetItemCall > 0) {
        expect(storageService.setItem.mock.calls[0][0]).toStrictEqual(urlToGet);
        expect(storageService.setItem.mock.calls[0][1]).toStrictEqual(dataToGet);
      }

      expect(storageService.getItem).toBeCalledTimes(expectedGetItemCall);
      if (expectedGetItemCall > 0) {
        expect(storageService.getItem.mock.calls[0][0]).toStrictEqual(urlToGet);
      }
    });
  });

  const getArrayOnlineFirstItems = [
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: true, keyname: 'keyname', expectedGetArrayCall: 0, expectedHttpGetCall: 1, expectedSetItemCall: 1,
    },
    {
      throwAnHttpConnAborted: false, isOnlineAndSync: false, keyname: 'keyname', expectedGetArrayCall: 1, expectedHttpGetCall: 0, expectedSetItemCall: 0,
    },
    {
      throwAnHttpConnAborted: true, isOnlineAndSync: true, keyname: 'keyname', expectedGetArrayCall: 1, expectedHttpGetCall: 1, expectedSetItemCall: 0,
    },
  ];
  describe.each(getArrayOnlineFirstItems)('getArrayOnlineFirst', ({
    throwAnHttpConnAborted, isOnlineAndSync, keyname, expectedGetArrayCall, expectedHttpGetCall, expectedSetItemCall,
  }) => {
    it('shoud call the http proxy or call the storageService', async () => {
      // Arrange
      const dataToGet = [{ data: 'some data' }];
      const urlToGet = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'get').mockImplementation(async () => {
        if (throwAnHttpConnAborted) {
          const axiosError = new Error('timeout');
          axiosError.code = 'ECONNABORTED';

          throw new HttpError(axiosError.message, axiosError);
        }

        const dataToReturn = {};
        dataToReturn[keyname] = dataToGet;
        return Promise.resolve(dataToReturn);
      });

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(storageService, 'getArray').mockImplementation(async () => Promise.resolve(dataToGet));
      jest.spyOn(storageService, 'setItem');

      // Act
      const data = await progressiveHttpProxy.getArrayOnlineFirst(urlToGet, keyname, updateFn);

      // Assert
      expect(data).toStrictEqual(dataToGet);

      expect(httpProxy.get).toBeCalledTimes(expectedHttpGetCall);
      if (expectedHttpGetCall > 0) {
        expect(httpProxy.get.mock.calls[0][0]).toStrictEqual(urlToGet);
      }

      expect(storageService.setItem).toBeCalledTimes(expectedSetItemCall);
      if (expectedSetItemCall > 0) {
        expect(storageService.setItem.mock.calls[0][0]).toStrictEqual(urlToGet);
        expect(storageService.setItem.mock.calls[0][1]).toStrictEqual(dataToGet);
      }

      expect(storageService.getArray).toBeCalledTimes(expectedGetArrayCall);
      if (expectedGetArrayCall > 0) {
        expect(storageService.getArray.mock.calls[0][0]).toStrictEqual(urlToGet);
      }
    });
  });
});
