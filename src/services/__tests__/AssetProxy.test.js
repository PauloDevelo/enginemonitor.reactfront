// import localforage from 'localforage';
import ignoredMessages from '../../testHelpers/MockConsole';

import httpProxy from '../HttpProxy';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import assetProxy from '../AssetProxy';
import actionManager from '../ActionManager';
import assetManager from '../AssetManager';
import userContext from '../UserContext';
import HttpError from '../../http/HttpError';

import { updateAsset } from '../../helpers/AssetHelper';

jest.mock('../HttpProxy');
jest.mock('../OnlineManager');
jest.mock('../AssetManager');
jest.mock('../UserProxy');
jest.mock('../UserContext');
// jest.mock('localforage');

describe('Test AsseProxy', () => {
  const user = { email: 'test@gmail.com', forbidCreatingAsset: false };

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function AssetProxy.existAsset expects a non null and non undefined asset id.');
  });

  const urlFetchAssets = `${process.env.REACT_APP_API_URL_BASE}assets/`;

  const assetToSave = {
    _uiId: 'an id generated by the front',
    name: 'Arbutus',
    brand: 'Aluminum & Technics',
    modelBrand: 'Heliotrope',
    manufactureDate: new Date(1979, 6, 10),
  };

  beforeEach(async () => {
    user.forbidCreatingAsset = false;
    await storageService.openUserStorage(user);

    assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
    assetManager.onAssetsChanged.mockImplementation(async () => {});

    userContext.getCurrentUser.mockImplementation(() => user);
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchAssets, undefined);
    storageService.closeUserStorage();

    httpProxy.setConfig.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.get.mockRestore();

    assetManager.onAssetsChanged.mockRestore();
    assetManager.getUserCredentials.mockRestore();

    userContext.getCurrentUser.mockRestore();

    onlineManager.isOnlineAndSynced.mockRestore();
  });

  describe('fetchAsset', () => {
    it('should try to get the asset from the backend when online', async (done) => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));
      httpProxy.get.mockImplementation((url) => {
        if (url === urlFetchAssets) {
          return Promise.resolve({ assets: [assetToSave] });
        }

        throw new Error(`Unexpected url ${url}`);
      });

      // Act
      const assets = await assetProxy.fetchAssets();

      // Assert
      expect(httpProxy.get).toHaveBeenCalledTimes(1);
      expect(assets[0]).toEqual(assetToSave);
      done();
    });

    it('should try to get the asset from the storage when the back end fails to return something', async (done) => {
      // Arrange
      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await assetProxy.createOrSaveAsset(assetToSave);

      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));
      httpProxy.get.mockImplementation(() => {
        throw new HttpError('Unexpected error', { code: 'ECONNABORTED' });
      });

      // Act
      const assets = await assetProxy.fetchAssets();

      // Assert
      expect(httpProxy.get).toHaveBeenCalledTimes(1);
      expect(assets[0]).toEqual(assetToSave);
      done();
    });

    it('should try to get the asset from the local storage when offline', async (done) => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await assetProxy.createOrSaveAsset(assetToSave);

      // Act
      const assets = await assetProxy.fetchAssets();

      // Assert
      expect(assets[0]).toEqual(assetToSave);
      done();
    });

    it('should try to get the asset from the local storage when force to', async (done) => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await assetProxy.createOrSaveAsset(assetToSave);

      // Act
      const assets = await assetProxy.fetchAssets(true);

      // Assert
      expect(assets[0]).toEqual(assetToSave);
      done();
    });
  });

  describe('createOrSaveAsset', () => {
    const createOrSaveAssetParams = [
      {
        isOnline: false, expectedPostCounter: 0, expectedNbAsset: 1, expectedNbAction: 1,
      },
      {
        isOnline: true, expectedPostCounter: 1, expectedNbAsset: 1, expectedNbAction: 0,
      },
    ];
    describe.each(createOrSaveAssetParams)('createOrSaveAsset', ({
      isOnline, expectedPostCounter, expectedNbAsset, expectedNbAction,
    }) => {
      it(`when ${JSON.stringify({
        isOnline, expectedPostCounter, expectedNbAsset, expectedNbAction,
      })}`, async () => {
        // Arrange
        onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

        let postCounter = 0;
        httpProxy.post.mockImplementation((url, data) => {
          postCounter++;
          return Promise.resolve(data);
        });

        // Act
        const assetSaved = await assetProxy.createOrSaveAsset(assetToSave);

        // Assert
        expect(postCounter).toBe(expectedPostCounter);
        expect(assetSaved).toEqual(assetToSave);

        const assets = await storageService.getItem(urlFetchAssets);
        expect(assets.length).toBe(expectedNbAsset);

        if (expectedNbAsset > 0) {
          const storedAsset = updateAsset(assets[0]);
          expect(storedAsset).toEqual(assetToSave);
        }

        expect(actionManager.countAction()).toBe(expectedNbAction);
      });
    });

    it('should throw an httperror exception with credential error when the user is forbid to create an asset', async (done) => {
      // Arrange
      user.forbidCreatingAsset = true;
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));
      jest.spyOn(httpProxy, 'post');

      try {
        // Act
        await assetProxy.createOrSaveAsset(assetToSave);
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });

        expect(httpProxy.post).toBeCalledTimes(0);

        const assets = await storageService.getArray(urlFetchAssets);
        expect(assets.length).toBe(0);
        expect(actionManager.countAction()).toBe(0);
        done();
      }
    });
  });

  const deleteAssetParams = [
    {
      isOnline: false, expectedDeleteCounter: 0, expectedNbAsset: 0, expectedNbAction: 2,
    },
    {
      isOnline: true, expectedDeleteCounter: 1, expectedNbAsset: 0, expectedNbAction: 0,
    },
  ];
  describe.each(deleteAssetParams)('deleteAsset', ({
    isOnline, expectedDeleteCounter, expectedNbAsset, expectedNbAction,
  }) => {
    it(`when ${JSON.stringify({
      isOnline, expectedDeleteCounter, expectedNbAsset, expectedNbAction,
    })}`, async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      const savedAsset = await assetProxy.createOrSaveAsset(assetToSave);

      let postCounter = 0;
      httpProxy.deleteReq.mockImplementation(() => {
        postCounter++;
        return Promise.resolve({ asset: savedAsset });
      });

      // Act
      const assetDeleted = await assetProxy.deleteAsset(assetToSave._uiId);

      // Assert
      expect(postCounter).toBe(expectedDeleteCounter);
      expect(assetDeleted).toEqual(assetToSave);

      const assets = await storageService.getItem(urlFetchAssets);
      expect(assets.length).toBe(expectedNbAsset);

      expect(actionManager.countAction()).toBe(expectedNbAction);
    });
  });

  const existAssetParams = [
    { isOnline: true, assetId: assetToSave._uiId, expectedResult: true },
    { isOnline: true, assetId: 'an_id', expectedResult: false },
    { isOnline: true, assetId: undefined, expectedResult: false },
    { isOnline: false, assetId: assetToSave._uiId, expectedResult: true },
    { isOnline: false, assetId: 'an_id', expectedResult: false },
    { isOnline: false, assetId: undefined, expectedResult: false },
  ];
  describe.each(existAssetParams)('existAsset', ({
    isOnline, assetId, expectedResult,
  }) => {
    it(`when ${JSON.stringify({
      isOnline, assetId, expectedResult,
    })}`, async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

      let getCounter = 0;
      httpProxy.get.mockImplementation((url) => {
        if (url === urlFetchAssets) {
          getCounter++;
        }

        return Promise.resolve({ name: 'arbutus' });
      });

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

      await assetProxy.createOrSaveAsset(assetToSave);

      // Act
      const isAssetExist = await assetProxy.existAsset(assetId);

      // Assert
      expect(isAssetExist).toBe(expectedResult);
      expect(getCounter).toBe(0);
    });
  });
});
