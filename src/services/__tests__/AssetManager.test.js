import ignoredMessages from '../../testHelpers/MockConsole';

import userProxy from '../UserProxy';
import assetProxy from '../AssetProxy';
import userContext from '../UserContext';

import assetManager from '../AssetManager';

jest.mock('../AssetProxy');
jest.mock('../UserProxy');

describe('Test AssetManager', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  beforeEach(() => {
    userProxy.getCredentials.mockImplementation(async () => ({ readonly: false }));
  });

  afterEach(async () => {
    assetProxy.fetchAssets.mockReset();
    userProxy.getCredentials.mockRestore();
  });

  describe('getCurrentAsset', () => {
    it('Should return null before logging in the user', () => {
      // Arrange

      // Act
      const currentAsset = assetManager.getCurrentAsset();

      // Assert
      expect(currentAsset).toBeNull();
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

    it('Should return null after the user logged out.', async () => {
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

      await userContext.onUserChanged(undefined);

      // Act
      const currentAsset = assetManager.getCurrentAsset();

      // Assert
      expect(assetProxy.fetchAssets).toBeCalledTimes(1);
      expect(currentAsset).toBeNull();
    });
  });
});
