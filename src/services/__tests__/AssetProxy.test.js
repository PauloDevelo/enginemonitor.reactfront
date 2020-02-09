import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import assetProxy from '../AssetProxy';
import actionManager from '../ActionManager';

import { updateAsset } from '../../helpers/AssetHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test AsseProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function AssetProxy.existAsset expects a non null and non undefined asset id.');
  });

  const urlFetchAssets = `${process.env.REACT_APP_URL_BASE}assets/`;

  const assetToSave = {
    _uiId: 'an id generated by the front',
    name: 'Arbutus',
    brand: 'Aluminum & Technics',
    modelBrand: 'Heliotrope',
    manufactureDate: new Date(1979, 6, 10),
  };

  beforeEach(() => {
    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();

    const user = { email: 'test@gmail.com' };
    storageService.openUserStorage(user);
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchAssets, undefined);
    storageService.closeUserStorage();
  });

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
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

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

      expect(await actionManager.countAction()).toBe(expectedNbAction);
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
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

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

      expect(await actionManager.countAction()).toBe(expectedNbAction);
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
  describe.each(existAssetParams)('existEquipment', ({
    isOnline, assetId, expectedResult,
  }) => {
    it(`when ${JSON.stringify({
      isOnline, assetId, expectedResult,
    })}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

      let getCounter = 0;
      httpProxy.get.mockImplementation(() => {
        getCounter++;
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