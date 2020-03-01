import HttpError from '../../http/HttpError';
import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import onlineManager from '../OnlineManager';
import actionManager, { ActionType } from '../ActionManager';
import assetManager from '../AssetManager';
import userContext from '../UserContext';

import { createDefaultUser } from '../../helpers/UserHelper';
import { createImageModel, base64ToBlob } from '../../helpers/ImageHelper';
import progressiveHttpProxy from '../ProgressiveHttpProxy';

jest.mock('../HttpProxy');
jest.mock('../StorageService');
jest.mock('../OnlineManager');
jest.mock('../ActionManager');
jest.mock('../AssetManager');
jest.mock('../UserContext');

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
    onlineManager.isOnlineAndSynced.mockReset();
  }

  function resetMockActionManager() {
    actionManager.addAction.mockReset();
  }

  beforeEach(() => {
    assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));

    const user = createDefaultUser();
    user.email = 'test@gmail.com';
    user.firstname = 'Paul';
    user.imageFolder = 'aklsnfdasknf';
    user.imageFolderSizeInByte = 0;
    user.imageFolderSizeLimitInByte = 555555555;
    userContext.getCurrentUser.mockImplementation(() => user);
  });

  afterEach(async () => {
    resetMockHttpProxy();
    resetMockStorageService();
    resetMockSyncService();
    resetMockActionManager();
    assetManager.getUserCredentials.mockRestore();
    userContext.getCurrentUser.mockRestore();
  });

  describe('postNewImage', () => {
    const postNewImageItems = [
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: true, addActionNbCall: 0, expectedHttpPostCall: 1,
      },
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: false, addActionNbCall: 1, expectedHttpPostCall: 0,
      },
      {
        throwAnHttpConnAborted: true, isOnlineAndSync: true, addActionNbCall: 1, expectedHttpPostCall: 1,
      },
    ];
    describe.each(postNewImageItems)('postNewImage', ({
      throwAnHttpConnAborted, isOnlineAndSync, addActionNbCall, expectedHttpPostCall,
    }) => {
      it('shoud call the http proxy or add the expected action in action manager', async () => {
        // Arrange
        const imageToCreate = createImageModel('parentUiId');
        imageToCreate.name = 'my first image';

        const thumbnail = base64ToBlob('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', 'image/jpeg');
        const imageData = base64ToBlob('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', 'image/jpeg');

        const urlToPost = 'an_url';

        jest.spyOn(httpProxy, 'postImage').mockImplementation(async (url, imageMetaData) => {
          if (throwAnHttpConnAborted) {
            const axiosError = new Error('timeout');
            axiosError.code = 'ECONNABORTED';

            throw new HttpError(axiosError.message, axiosError);
          }

          return Promise.resolve({ image: imageMetaData });
        });

        onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

        jest.spyOn(actionManager, 'addAction');

        // Act
        const dataPosted = await progressiveHttpProxy.postNewImage(urlToPost, imageToCreate, imageData, thumbnail);

        // Assert
        if (addActionNbCall > 0) {
          expect(dataPosted).toStrictEqual({ ...imageToCreate, sizeInByte: 1024 * 450 });
        } else {
          expect(dataPosted).toStrictEqual(imageToCreate);
        }

        expect(httpProxy.postImage).toBeCalledTimes(expectedHttpPostCall);
        if (expectedHttpPostCall > 0) {
          expect(httpProxy.postImage.mock.calls[0][0]).toStrictEqual(urlToPost);
          expect(httpProxy.postImage.mock.calls[0][1]).toStrictEqual(imageToCreate);
        }

        expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
        if (addActionNbCall > 0) {
          expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(urlToPost);
          expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.CreateImage);
          expect(actionManager.addAction.mock.calls[0][0].data).toStrictEqual(imageToCreate);
        }
      });
    });

    it('should bubble up unexpected exception from the post query', async (done) => {
      // Arrange
      const imageToCreate = createImageModel('parentUiId');
      imageToCreate.name = 'my first image';

      const thumbnail = base64ToBlob('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', 'image/jpeg');
      const imageData = base64ToBlob('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', 'image/jpeg');

      const urlToPost = 'an_url';

      jest.spyOn(httpProxy, 'postImage').mockImplementation(async () => {
        throw new Error('An unexpected exception');
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.postNewImage(urlToPost, imageToCreate, imageData, thumbnail);
      } catch (error) {
        // Assert
        expect(error.message).toBe('An unexpected exception');
        expect(httpProxy.postImage).toBeCalledTimes(1);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });
  });


  describe('postAndUpdate', () => {
    const postAndUpdateItems = [
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: true, addActionNbCall: 0, expectedHttpPostCall: 1,
      },
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: false, addActionNbCall: 1, expectedHttpPostCall: 0,
      },
      {
        throwAnHttpConnAborted: true, isOnlineAndSync: true, addActionNbCall: 1, expectedHttpPostCall: 1,
      },
    ];
    describe.each(postAndUpdateItems)('postAndUpdate', ({
      throwAnHttpConnAborted, isOnlineAndSync, addActionNbCall, expectedHttpPostCall,
    }) => {
      it('shoud call the http proxy or add the expected action in action manager', async (done) => {
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

        onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

        jest.spyOn(actionManager, 'addAction');

        // Act
        const dataPosted = await progressiveHttpProxy.postAndUpdate(urlToPost, 'keyname', dataToPost, updateFn);

        // Assert
        expect(dataPosted).toStrictEqual(dataToPost);

        expect(httpProxy.post).toBeCalledTimes(expectedHttpPostCall);
        if (expectedHttpPostCall > 0) {
          expect(httpProxy.post.mock.calls[0][0]).toStrictEqual(urlToPost);
          expect(httpProxy.post.mock.calls[0][1].keyname).toStrictEqual(dataToPost);
        }

        expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
        if (addActionNbCall > 0) {
          expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(urlToPost);
          expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.Post);
          expect(actionManager.addAction.mock.calls[0][0].data.keyname).toStrictEqual(dataToPost);
        }
        done();
      });
    });

    it('shoud bubble up unexpected exception from httpProxy', async (done) => {
      // Arrange
      const dataToPost = { data: 'some data' };
      const urlToPost = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'post').mockImplementation(async () => {
        throw new Error('unexpected error');
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.postAndUpdate(urlToPost, 'keyname', dataToPost, updateFn);
      } catch (error) {
        // Assert
        expect(error.message).toBe('unexpected error');
        expect(httpProxy.post).toBeCalledTimes(1);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });
  });

  describe('deleteAndUpdate', () => {
    const deleteAndUpdateItems = [
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: true, addActionNbCall: 0, expectedHttpDeleteCall: 1,
      },
      {
        throwAnHttpConnAborted: false, isOnlineAndSync: false, addActionNbCall: 1, expectedHttpDeleteCall: 0,
      },
      {
        throwAnHttpConnAborted: true, isOnlineAndSync: true, addActionNbCall: 1, expectedHttpDeleteCall: 1,
      },
    ];
    describe.each(deleteAndUpdateItems)('deleteAndUpdate', ({
      throwAnHttpConnAborted, isOnlineAndSync, addActionNbCall, expectedHttpDeleteCall,
    }) => {
      it('shoud call the http proxy or add the expected action in action manager', async (done) => {
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
          dataToReturn.keyname = dataToDelete;
          return Promise.resolve(dataToReturn);
        });

        onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

        jest.spyOn(actionManager, 'addAction');

        // Act
        await progressiveHttpProxy.deleteAndUpdate(urlToDelete, 'keyname', updateFn);

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
        done();
      });
    });

    it('should bubble up unexpected exception', async (done) => {
      // Arrange
      const urlToDelete = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'deleteReq').mockImplementation(async () => {
        throw new Error('Unexpected exception');
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.deleteAndUpdate(urlToDelete, 'keyname', updateFn);
      } catch (error) {
        // Assert
        expect(error.message).toBe('Unexpected exception');
        expect(httpProxy.deleteReq).toBeCalledTimes(1);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });
  });


  describe('getOnlineFirst', () => {
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
      it('shoud call the http proxy or call the storageService', async (done) => {
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

        onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

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
        done();
      });
    });

    it('shoud bubble up unexpected exception', async (done) => {
      // Arrange
      const dataToGet = { data: 'some data' };
      const urlToGet = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'get').mockImplementation(async () => {
        throw new Error('Unexpected exception');
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));

      jest.spyOn(storageService, 'getItem').mockImplementation(async () => Promise.resolve(dataToGet));
      jest.spyOn(storageService, 'setItem');

      try {
        // Act
        await progressiveHttpProxy.getOnlineFirst(urlToGet, 'keyname', updateFn);
      } catch (error) {
        // Assert
        expect(error.message).toBe('Unexpected exception');
        expect(httpProxy.get).toBeCalledTimes(1);
        expect(storageService.setItem).toBeCalledTimes(0);
        expect(storageService.getItem).toBeCalledTimes(0);
        done();
      }
    });
  });


  describe('getArrayOnlineFirst', () => {
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

        onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

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

    it('should bubble up the exception', async (done) => {
      // Arrange
      const urlToGet = 'an_url';

      jest.spyOn(httpProxy, 'get').mockImplementation(async () => {
        throw new Error('An unexpected error');
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));

      try {
        // Act
        await progressiveHttpProxy.getArrayOnlineFirst(urlToGet, 'keyname');
      } catch (error) {
        // Assert
        expect(error.message).toEqual('An unexpected error');
        done();
      }
    });
  });

  const onlineModes = [{ isOnline: true }, { isOnline: false }];
  describe.each(onlineModes)('when the user is in readonly on the current asset', ({ isOnline }) => {
    beforeEach(() => {
      userContext.getCurrentUser().forbidUploadingImage = true;
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: true }));
    });

    it('shoud just throw an exception http with a credential error when calling postandupdate', async (done) => {
      // Arrange
      const dataToPost = { data: 'some data' };
      const urlToPost = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'post').mockImplementation(async (url, data) => Promise.resolve(data));

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnline));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.postAndUpdate(urlToPost, 'keyname', dataToPost, updateFn);
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });

        expect(httpProxy.post).toBeCalledTimes(0);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });

    it('shoud just throw an exception http with a credential error when calling deleteAndUpdate', async (done) => {
      // Arrange
      const dataToDelete = { data: 'some data' };
      const urlToDelete = 'an_url';
      const updateFn = jest.fn((data) => data);

      jest.spyOn(httpProxy, 'deleteReq').mockImplementation(async () => {
        const dataToReturn = {};
        dataToReturn.keyname = dataToDelete;
        return Promise.resolve(dataToReturn);
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnline));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.deleteAndUpdate(urlToDelete, 'keyname', updateFn);
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });

        expect(httpProxy.deleteReq).toBeCalledTimes(0);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });

    it('shoud just throw an exception http with a credential error when calling postNewImage', async (done) => {
      // Arrange
      const imageToCreate = createImageModel('parentUiId');
      imageToCreate.name = 'my first image';

      const thumbnail = base64ToBlob('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', 'image/jpeg');
      const imageData = base64ToBlob('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', 'image/jpeg');

      const urlToPost = 'an_url';

      jest.spyOn(httpProxy, 'postImage').mockImplementation(async (url, imageMetaData) => Promise.resolve({ image: imageMetaData }));

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnline));

      jest.spyOn(actionManager, 'addAction');

      try {
        // Act
        await progressiveHttpProxy.postNewImage(urlToPost, imageToCreate, imageData, thumbnail);
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });

        expect(httpProxy.postImage).toBeCalledTimes(0);
        expect(actionManager.addAction).toBeCalledTimes(0);
        done();
      }
    });
  });
});
