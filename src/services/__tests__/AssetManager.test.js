import ignoredMessages from '../../testHelpers/MockConsole';
import { delayFewMilliseconds } from '../../testHelpers/EnzymeHelper';

import assetProxy from '../AssetProxy';
import userContext from '../UserContext';

import assetManager from '../AssetManager';

jest.mock('../AssetProxy');

describe('Test ActionManager', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  beforeEach(() => {
  });

  afterEach(async () => {
    assetProxy.fetchAssets.mockReset();
  });

  describe('getCurrentAsset', () => {
    it('Should return undefined before logging in the user', () => {
      // Arrange

      // Act
      const currentAsset = assetManager.getCurrentAsset();

      // Assert
      expect(currentAsset).toBeUndefined();
    });

    it('Should return undefined after logging in a user who does not have any asset yet', async () => {
      // Arrange
      assetProxy.fetchAssets.mockImplementation(() => Promise.resolve([]));
      await userContext.onUserChanged({
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      });

      // Act
      const currentAsset = assetManager.getCurrentAsset();

      // Assert
      expect(assetProxy.fetchAssets).toBeCalledTimes(1);
      expect(currentAsset).toBeUndefined();
    });

    it('Should return the first asset issued by fetchAssets after logging in a user who does have assets', async () => {
      // Arrange
      const asset1 = {
        _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrop', manufactureDate: new Date(2019, 6, 10),
      };
      const asset2 = {
        _uiId: 'asset_02', name: 'Voiture', brand: 'Tesla', modelBrand: 'S', manufactureDate: new Date(2019, 9, 10),
      };
      assetProxy.fetchAssets.mockImplementation(async () => Promise.resolve([asset1, asset2]));

      await userContext.onUserChanged({
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      });

      // Act
      const currentAsset = assetManager.getCurrentAsset();

      // Assert
      expect(assetProxy.fetchAssets).toBeCalledTimes(1);
      expect(currentAsset).toEqual(asset1);
    });
  });
});
