// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import httpProxy from '../HttpProxy';
import HttpError from '../../http/HttpError';

import ignoredMessages from '../../testHelpers/MockConsole';

import storageService from '../StorageService';
import userContext from '../UserContext';
import onlineManager from '../OnlineManager';
import actionManager, { ActionType } from '../ActionManager';
import assetManager from '../AssetManager';

import imageProxy from '../ImageProxy';
import { createDefaultUser } from '../../helpers/UserHelper';
import { createImageModel, base64ToBlob, blobToDataURL } from '../../helpers/ImageHelper';

jest.mock('localforage');
jest.mock('../HttpProxy');
jest.mock('../StorageService');
jest.mock('../UserContext');
jest.mock('../OnlineManager');
jest.mock('../ActionManager');
jest.mock('../AssetManager');

describe('Test ImageProxy', () => {
  const parentId = 'an_entity_id';
  const urlFetchImage = `${process.env.REACT_APP_API_URL_BASE}images/${parentId}`;

  const user = createDefaultUser();
  user.email = 'test@gmail.com';
  user.firstname = 'Paul';
  user.imageFolderSizeInByte = 0;
  user.imageFolderSizeLimitInByte = 555555555;
  userContext.getCurrentUser.mockImplementation(() => user);

  const imageToSave = createImageModel(parentId);
  imageToSave.name = 'my first image';

  const thumbnail = base64ToBlob('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', 'image/jpeg');
  const imageData = base64ToBlob('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', 'image/jpeg');

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

  function resetMockUserContext() {
    userContext.onImageRemoved.mockReset();
    userContext.onImageAdded.mockReset();
  }

  function resetMockSyncService() {
    onlineManager.isOnlineAndSynced.mockReset();
  }

  function resetMockActionManager() {
    actionManager.addAction.mockReset();
  }

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('timeout');
  });

  beforeEach(() => {
    assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
  });

  afterEach(async () => {
    resetMockHttpProxy();
    resetMockStorageService();
    resetMockUserContext();
    resetMockSyncService();
    resetMockActionManager();
    assetManager.getUserCredentials.mockRestore();
  });

  const createImageDataItems = [
    {
      postImageThrowException: false, isOnlineAndSync: true, postImageNbCall: 1, addActionNbCall: 0, imageSizeInByte: 1024,
    },
    {
      postImageThrowException: false, isOnlineAndSync: false, postImageNbCall: 0, addActionNbCall: 1, imageSizeInByte: 450 * 1024,
    },
    {
      postImageThrowException: true, isOnlineAndSync: true, postImageNbCall: 1, addActionNbCall: 1, imageSizeInByte: 450 * 1024,
    },
  ];
  describe.each(createImageDataItems)('createImage', ({
    postImageThrowException, isOnlineAndSync, postImageNbCall, addActionNbCall, imageSizeInByte,
  }) => {
    it(`shoud call http proxy ${postImageNbCall} times with the expected url and notify the change in the user storage size since we added an image when the app is ${isOnlineAndSync ? '' : 'not'} sync and online`, async () => {
      // Arrange
      const thumbnailDataUrl = await blobToDataURL(thumbnail);
      const imageDataUrl = await blobToDataURL(imageData);

      const newImage = { ...imageToSave, sizeInByte: imageSizeInByte };

      jest.spyOn(httpProxy, 'postImage').mockImplementation(async () => {
        if (postImageThrowException) {
          const axiosError = new Error('timeout');
          axiosError.code = 'ECONNABORTED';

          throw new HttpError(axiosError.message, axiosError);
        }

        return Promise.resolve({
          image: newImage,
        });
      });

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(userContext, 'onImageAdded');
      jest.spyOn(actionManager, 'addAction');
      jest.spyOn(storageService, 'setItem');
      jest.spyOn(storageService, 'updateArray');

      // Act
      const imageSaved = await imageProxy.createImage(imageToSave, imageData, thumbnail);

      // Assert
      expect(imageSaved).toStrictEqual(newImage);

      expect(httpProxy.postImage).toBeCalledTimes(postImageNbCall);
      if (postImageNbCall > 0) {
        expect(httpProxy.postImage.mock.calls[0][0]).toStrictEqual(urlFetchImage);
        expect(httpProxy.postImage.mock.calls[0][1]).toStrictEqual(imageToSave);
        expect(httpProxy.postImage.mock.calls[0][2]).toStrictEqual(imageData);
        expect(httpProxy.postImage.mock.calls[0][3]).toStrictEqual(thumbnail);
      }

      expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
      if (addActionNbCall > 0) {
        expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(urlFetchImage);
        expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.CreateImage);
        expect(actionManager.addAction.mock.calls[0][0].data).toStrictEqual(imageToSave);
      }

      expect(storageService.setItem).toBeCalledTimes(2);
      expect(storageService.setItem.mock.calls[0][0]).toBe(imageToSave.url);
      expect(storageService.setItem.mock.calls[0][1]).toBe(imageDataUrl);

      expect(storageService.setItem.mock.calls[1][0]).toBe(imageToSave.thumbnailUrl);
      expect(storageService.setItem.mock.calls[1][1]).toBe(thumbnailDataUrl);

      expect(storageService.updateArray).toBeCalledTimes(1);

      expect(userContext.onImageAdded).toBeCalledTimes(1);
      expect(userContext.onImageAdded.mock.calls[0][0]).toBe(imageSizeInByte);
    });
  });

  const fetchImagesDataItems = [
    {
      forceToLookUpInStorage: undefined, isOnlineAndSync: true, getImageNbCall: 1, getArrayInStorageNbCall: 0,
    },
    {
      forceToLookUpInStorage: undefined, isOnlineAndSync: false, getImageNbCall: 0, getArrayInStorageNbCall: 1,
    },
    {
      forceToLookUpInStorage: true, isOnlineAndSync: true, getImageNbCall: 0, getArrayInStorageNbCall: 0,
    },
    {
      forceToLookUpInStorage: false, isOnlineAndSync: true, getImageNbCall: 1, getArrayInStorageNbCall: 0,
    },
    {
      forceToLookUpInStorage: true, isOnlineAndSync: false, getImageNbCall: 0, getArrayInStorageNbCall: 0,
    },
    {
      forceToLookUpInStorage: false, isOnlineAndSync: false, getImageNbCall: 0, getArrayInStorageNbCall: 1,
    },
  ];
  describe.each(fetchImagesDataItems)('fetchImage', ({
    isOnlineAndSync, getImageNbCall, getArrayInStorageNbCall, forceToLookUpInStorage,
  }) => {
    it('shoud call the http proxy or the getArray in the storage with the expected url depending on the isOnlineAndSync value', async () => {
      // Arrange
      const images = [];
      jest.spyOn(httpProxy, 'get').mockImplementation(() => ({ images }));
      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));
      jest.spyOn(storageService, 'setItem');
      storageService.getArray.mockImplementation(async () => Promise.resolve(images));
      imageProxy.inMemory[urlFetchImage] = images;

      // Act
      await imageProxy.fetchImages({ parentUiId: parentId, forceToLookUpInStorage });

      // Assert
      expect(httpProxy.get).toBeCalledTimes(getImageNbCall);
      expect(storageService.setItem).toBeCalledTimes(getImageNbCall);
      if (getImageNbCall > 0) {
        expect(httpProxy.get.mock.calls[0][0]).toStrictEqual(urlFetchImage);

        expect(storageService.setItem.mock.calls[0][0]).toStrictEqual(urlFetchImage);
        expect(storageService.setItem.mock.calls[0][1]).toStrictEqual(images);
      }

      expect(storageService.getArray).toBeCalledTimes(getArrayInStorageNbCall);
      if (getArrayInStorageNbCall > 0) {
        expect(storageService.getArray.mock.calls[0][0]).toStrictEqual(urlFetchImage);
      }
    });
  });

  const updateImageDataItems = [
    { isOnlineAndSynced: true, postNbCall: 1, addActionNbCall: 0 },
    { isOnlineAndSynced: false, postNbCall: 0, addActionNbCall: 1 },
  ];
  describe.each(updateImageDataItems)('updateImage', ({ isOnlineAndSynced, postNbCall, addActionNbCall }) => {
    it('shoud call the http proxy or addAction with the updated image and it should update the storage', async () => {
      // Arrange
      const imageToUpdate = {
        ...imageToSave, title: 'new image title', description: 'new image description', sizeInByte: 1024,
      };

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSynced));
      httpProxy.post.mockImplementation((url, data) => data);

      jest.spyOn(actionManager, 'addAction');
      jest.spyOn(storageService, 'updateArray');

      // Act
      const updatedImage = await imageProxy.updateImage(imageToUpdate);

      // Assert
      expect(updatedImage).toStrictEqual(imageToUpdate);
      expect(httpProxy.post).toBeCalledTimes(postNbCall);
      if (postNbCall > 0) {
        expect(httpProxy.post.mock.calls[0][0]).toStrictEqual(`${urlFetchImage}/${imageToUpdate._uiId}`);
        expect(httpProxy.post.mock.calls[0][1]).toStrictEqual({ image: imageToUpdate });
      }

      expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
      if (addActionNbCall > 0) {
        expect(actionManager.addAction.mock.calls[0][0].key).toStrictEqual(`${urlFetchImage}/${imageToUpdate._uiId}`);
        expect(actionManager.addAction.mock.calls[0][0].type).toStrictEqual(ActionType.Post);
        expect(actionManager.addAction.mock.calls[0][0].data).toStrictEqual({ image: imageToUpdate });
      }

      expect(storageService.updateArray).toBeCalledTimes(1);
    });
  });

  const deleteImageDataItems = [
    { isOnlineAndSync: true, deleteReqNbCall: 1, addActionNbCall: 0 },
    { isOnlineAndSync: false, deleteReqNbCall: 0, addActionNbCall: 1 },
  ];
  describe.each(deleteImageDataItems)('deleteImage', ({ isOnlineAndSync, deleteReqNbCall, addActionNbCall }) => {
    it('Should delete the image on the server and in the storage', async () => {
      // Arrange
      const imageToDelete = { ...imageToSave };

      httpProxy.deleteReq.mockImplementationOnce(async (image) => (Promise.resolve({ image })));

      onlineManager.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(isOnlineAndSync));

      jest.spyOn(userContext, 'onImageRemoved');
      jest.spyOn(actionManager, 'addAction');
      jest.spyOn(storageService, 'removeItem');
      jest.spyOn(storageService, 'removeItemInArray').mockImplementation(async () => Promise.resolve(imageToDelete));

      // Act
      const deletedImage = await imageProxy.deleteImage(imageToDelete);

      // Assert
      expect(deletedImage).toEqual(imageToDelete);
      expect(httpProxy.deleteReq).toBeCalledTimes(deleteReqNbCall);
      if (deleteReqNbCall > 1) {
        expect(httpProxy.deleteReq.mock.calls[0][0]).toStrictEqual(`${urlFetchImage}/${imageToDelete._uiId}`);
      }

      expect(actionManager.addAction).toBeCalledTimes(addActionNbCall);
      if (deleteReqNbCall > 1) {
        expect(httpProxy.deleteReq.mock.calls[0][0]).toStrictEqual(`${urlFetchImage}/${imageToDelete._uiId}`);
      }

      expect(storageService.removeItemInArray).toHaveBeenCalledTimes(1);
      expect(storageService.removeItemInArray.mock.calls[0][0]).toStrictEqual(urlFetchImage);
      expect(storageService.removeItemInArray.mock.calls[0][1]).toStrictEqual(imageToDelete._uiId);

      expect(storageService.removeItem).toHaveBeenCalledTimes(2);
      expect(storageService.removeItem.mock.calls[0][0]).toStrictEqual(imageToDelete.url);
      expect(storageService.removeItem.mock.calls[1][0]).toStrictEqual(imageToDelete.thumbnailUrl);

      expect(userContext.onImageRemoved).toHaveBeenCalledTimes(1);
      expect(userContext.onImageRemoved.mock.calls[0][0]).toStrictEqual(imageToDelete.sizeInByte);
    });
  });

  describe('onEntityDeleted', () => {
    it('Should delete the image on the server and in the storage only for the entity deleted', async () => {
      // Arrange
      const imageToDelete = { ...imageToSave, sizeInByte: 2048 };
      imageProxy.inMemory[urlFetchImage] = [imageToDelete];

      jest.spyOn(httpProxy, 'deleteReq');

      storageService.getArray.mockImplementationOnce(async (url) => {
        if (url === urlFetchImage) {
          return Promise.resolve([imageToDelete]);
        }

        return [];
      });

      jest.spyOn(userContext, 'onImageRemoved');

      jest.spyOn(storageService, 'removeItemInArray').mockImplementation(async () => Promise.resolve(imageToDelete));
      jest.spyOn(storageService, 'removeItem');

      // Act
      await imageProxy.onEntityDeleted(parentId);

      // Assert
      expect(storageService.removeItemInArray).toHaveBeenCalledTimes(1);
      expect(storageService.removeItemInArray.mock.calls[0][0]).toStrictEqual(urlFetchImage);
      expect(storageService.removeItemInArray.mock.calls[0][1]).toStrictEqual(imageToDelete._uiId);

      expect(storageService.removeItem).toHaveBeenCalledTimes(2);
      expect(storageService.removeItem.mock.calls[0][0]).toStrictEqual(imageToDelete.url);
      expect(storageService.removeItem.mock.calls[1][0]).toStrictEqual(imageToDelete.thumbnailUrl);

      expect(userContext.onImageRemoved).toHaveBeenCalledTimes(1);
      expect(userContext.onImageRemoved.mock.calls[0][0]).toStrictEqual(2048);

      expect(httpProxy.deleteReq).toBeCalledTimes(0);
    });
  });
});
