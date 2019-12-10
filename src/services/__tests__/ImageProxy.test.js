import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import userContext from '../UserContext';
import imageProxy from '../ImageProxy';
import { createImageModel } from '../../helpers/ImageHelper';

jest.mock('../HttpProxy');

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

describe('Test ImageProxy', () => {
  const parentId = 'an_entity_id';
  const urlFetchImage = `${process.env.REACT_APP_URL_BASE}images/${parentId}`;

  const imageToSave = createImageModel(parentId);
  imageToSave.name = 'my first image';

  const thumbnail = b64toBlob('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', 'image/jpeg');
  const imageData = b64toBlob('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', 'image/jpeg');

  function resetMockHttpProxy() {
    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.deleteReq.mockReset();
    httpProxy.get.mockReset();
  }

  function setUser() {
    const user = {
      email: 'test@gmail.com',
      firstname: 'Paul',
      imageFolderSizeInByte: 0,
      imageFolderSizeLimitInByte: 555555555,
    };
    storageService.openUserStorage(user);
    userContext.onUserChanged(user);
  }

  async function clearStorage() {
    storageService.setItem(urlFetchImage, undefined);
    storageService.closeUserStorage();
  }

  beforeEach(() => {
    resetMockHttpProxy();
    setUser();
  });

  afterEach(async () => {
    clearStorage();
  });

  describe('createImage', () => {
    it('shoud call the http proxy with the expected url and notify the change in the user storage size since we added an image', async () => {
      // Arrange
      const newImage = {
        _uiId: '125f58f',
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        parentUiId: parentId,
        title: 'image title',
        description: 'image description',
        sizeInByte: 1024,
      };

      httpProxy.post.mockImplementation(() => ({
        image: newImage,
      }));

      let userStorageSize = userContext.getCurrentUser().imageFolderSizeInByte;
      const onUserStorageSizeChanged = jest.fn();

      onUserStorageSizeChanged.mockImplementation((newUserStorageSize) => { userStorageSize = newUserStorageSize; });
      userContext.registerOnUserStorageSizeChanged(onUserStorageSizeChanged);

      // Act
      const imageSaved = await imageProxy.createImage(imageToSave, imageData, thumbnail);

      // Assert
      expect(imageSaved).toBe(newImage);
      expect(httpProxy.post).toBeCalledTimes(1);
      expect(onUserStorageSizeChanged).toBeCalledTimes(1);
      expect(userStorageSize).toBe(1024);

      const images = await storageService.getItem(urlFetchImage);
      expect(images.length).toBe(1);
    });
  });

  describe('fetchImage', () => {
    it('shoud call the http proxy with the expected url when forceToLookUpInStorage is false', async () => {
      let httpGetUrl = '';
      httpProxy.get.mockImplementation((url) => {
        httpGetUrl = url;
        return {
          images: [],
        };
      });

      // Act
      await imageProxy.fetchImages({ parentUiId: parentId });

      // Assert
      expect(httpProxy.get).toBeCalledTimes(1);
      expect(httpGetUrl).toBe(urlFetchImage);
    });

    it('shoud not call the http proxy with the expected url when forceToLookUpInStorage is true', async () => {
      // Arrange
      const newImage = {
        _uiId: '125f58f',
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        parentUiId: parentId,
        title: 'image title',
        description: 'image description',
        sizeInByte: 1024,
      };

      httpProxy.post.mockImplementation(() => ({
        image: newImage,
      }));

      await imageProxy.createImage(imageToSave, imageData, thumbnail);

      httpProxy.get.mockImplementation(() => ({
        images: [newImage],
      }));

      // Act
      const images = await imageProxy.fetchImages({ parentUiId: parentId, forceToLookUpInStorage: true });

      // Assert
      expect(httpProxy.get).toBeCalledTimes(0);
      expect(images.length).toBe(1);
      expect(images[0]).toEqual(newImage);
    });
  });

  describe('updateImage', () => {
    it('shoud call the http proxy with the updated image and it should update the storage', async () => {
      // Arrange
      const newImage = {
        _uiId: '125f58f',
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        parentUiId: parentId,
        title: 'image title',
        description: 'image description',
        sizeInByte: 1024,
      };

      httpProxy.post.mockImplementationOnce(() => ({
        image: newImage,
      }));
      httpProxy.post.mockImplementationOnce((url, data) => data);

      await imageProxy.createImage(imageToSave, imageData, thumbnail);

      const updatedImage = {
        _uiId: '125f58f',
        parentUiId: parentId,
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        title: 'new image title',
        description: 'new image description',
        sizeInByte: 1024,
      };

      // Act
      await imageProxy.updateImage(updatedImage);

      // Assert
      const images = await storageService.getItem(urlFetchImage);
      expect(images.length).toBe(1);
      expect(images[0]._uiId).toEqual(newImage._uiId);
      expect(images[0].url).toEqual(newImage.url);
      expect(images[0].thumbnailUrl).toEqual(newImage.thumbnailUrl);
      expect(images[0].parentUiId).toEqual(newImage.parentUiId);
      expect(images[0].sizeInByte).toEqual(newImage.sizeInByte);
      expect(images[0].title).toEqual('new image title');
      expect(images[0].description).toEqual('new image description');
    });
  });

  describe('deleteImage', () => {
    it('Should delete the image on the server and in the storage', async () => {
      // Arrange
      const newImage = {
        _uiId: '125f58f',
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        parentUiId: parentId,
        title: 'image title',
        description: 'image description',
        sizeInByte: 1024,
      };

      httpProxy.post.mockImplementationOnce(() => ({
        image: newImage,
      }));

      httpProxy.deleteReq.mockImplementationOnce((imageToDelete) => ({
        image: imageToDelete,
      }));

      const imageSaved = await imageProxy.createImage(imageToSave, imageData, thumbnail);

      // Act
      const deletedImage = await imageProxy.deleteImage(imageSaved);

      // Assert
      const images = await storageService.getItem(urlFetchImage);
      expect(images.length).toBe(0);
      expect(deletedImage).toEqual(imageSaved);
      expect(httpProxy.deleteReq).toBeCalledTimes(1);
    });
  });

  describe('onEntityDeleted', () => {
    it('Should delete the image on the server and in the storage only for the entity deleted', async () => {
      // Arrange
      const newImage = {
        _uiId: '125f58f',
        url: 'image url',
        thumbnailUrl: 'thumbnail url',
        parentUiId: parentId,
        title: 'image title',
        description: 'image description',
        sizeInByte: 1024,
      };

      httpProxy.post.mockImplementationOnce(() => ({
        image: newImage,
      }));

      httpProxy.deleteReq.mockImplementationOnce((imageToDelete) => ({
        image: imageToDelete,
      }));

      await imageProxy.createImage(imageToSave, imageData, thumbnail);

      // Act
      await imageProxy.onEntityDeleted(parentId);

      // Assert
      const images = await storageService.getItem(urlFetchImage);
      expect(images.length).toBe(0);
      expect(httpProxy.deleteReq).toBeCalledTimes(0);
    });
  });
});
