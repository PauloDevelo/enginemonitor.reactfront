import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import userContext from '../UserContext';
import imageProxy from '../ImageProxy';

jest.mock('../HttpProxy');

describe('Test ImageProxy', () => {
  const parentId = 'an_entity_id';
  const urlFetchImage = `${process.env.REACT_APP_URL_BASE}images/${parentId}`;

  const imageToSave = new FormData();
  imageToSave.append('name', 'my first image');
  imageToSave.append('imageData', 'The image content');
  imageToSave.append('thumbnail', 'the thumbnail content');
  imageToSave.append('parentUiId', parentId);
  imageToSave.append('_uiId', 'uuid_of_my_image');

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
      const imageSaved = await imageProxy.createImage(imageToSave);

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

      await imageProxy.createImage(imageToSave);

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

      await imageProxy.createImage(imageToSave);

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

      const imageSaved = await imageProxy.createImage(imageToSave);

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

      await imageProxy.createImage(imageToSave);

      // Act
      await imageProxy.onEntityDeleted(parentId);

      // Assert
      const images = await storageService.getItem(urlFetchImage);
      expect(images.length).toBe(0);
      expect(httpProxy.deleteReq).toBeCalledTimes(0);
    });
  });
});
