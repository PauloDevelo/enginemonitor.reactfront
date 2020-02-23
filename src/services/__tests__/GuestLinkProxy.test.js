import { AssertionError } from 'assert';
import ignoredMessages from '../../testHelpers/MockConsole';

import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import assetManager from '../AssetManager';
import guestLinkProxy from '../GuestLinkProxy';
import HttpError from '../../http/HttpError';
import userContext from '../UserContext';

jest.mock('../HttpProxy');
jest.mock('../SyncService');
jest.mock('../AssetManager');
jest.mock('../StorageService');

describe('Test GuestLinkProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('Impossible to connect on the back end.');
  });

  beforeEach(async () => {
    const user = { email: 'test@gmail.com' };

    await storageService.openUserStorage(user);

    assetManager.setCurrentAsset({
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    });
  });

  afterEach(async () => {
    storageService.closeUserStorage();
    storageService.updateArray.mockRestore();
    storageService.setItem.mockRestore();
    storageService.getArray.mockRestore();
    storageService.removeItemInArray.mockRestore();

    httpProxy.setConfig.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.deleteReq.mockRestore();
    httpProxy.get.mockRestore();

    syncService.isOnline.mockRestore();

    assetManager.getUserCredentials.mockRestore();
  });

  describe('createGuestLink', () => {
    it('it should throw an exception if not online', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(false));

      // Act
      try {
        await guestLinkProxy.createGuestLink({ assetUiId: '', nameGuestLink: 'Guest link' });
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toBe('mustBeOnlineForSharedLinkCreation');
        done();
      }
    });

    it('it should throw an exception if the user does not enough credentials', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: true }));

      // Act
      try {
        await guestLinkProxy.createGuestLink({ assetUiId: '', nameGuestLink: 'Guest link' });
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });
        done();
      }
    });

    it('it should post the expected data to the correct url', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
      httpProxy.post.mockImplementation(async (url, data) => {
        if (url === `${process.env.REACT_APP_API_URL_BASE}guestlinks/`) {
          expect(data.assetUiId).toEqual('an_asset_ui_id');
          expect(data.nameGuestLink).toEqual('Guest link');

          return { guestlink: { data: 'somedata' } };
        }

        throw new Error('unexpected url');
      });
      storageService.updateArray.mockImplementation(() => {});

      // Act
      const guestlink = await guestLinkProxy.createGuestLink('an_asset_ui_id', 'Guest link');

      // Assert
      expect(httpProxy.post).toHaveBeenCalledTimes(1);
      expect(guestlink).toEqual({ data: 'somedata' });
      done();
    });

    it('it should add the new guestlink into the asset guestlink array in the storage', async (done) => {
      // Arrange
      const newGuestLink = { data: 'somedata' };
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
      httpProxy.post.mockImplementation(async () => ({ guestlink: newGuestLink }));
      storageService.updateArray.mockImplementation((key, data) => {
        if (key === `${process.env.REACT_APP_API_URL_BASE}guestlinks/asset/an_asset_ui_id`) {
          expect(data).toEqual(newGuestLink);
          return Promise.resolve([newGuestLink]);
        }

        throw new Error(`unexpected key: ${key}`);
      });

      // Act
      await guestLinkProxy.createGuestLink('an_asset_ui_id', 'Guest link');

      // Assert
      expect(storageService.updateArray).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getGuestLinks', () => {
    it('should try to get the guest links for the asset online first', async (done) => {
      // Arrange
      const guestLink = { data: 'somedata' };

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(true));
      storageService.setItem.mockImplementation(async () => {});
      httpProxy.get.mockImplementation(async (url) => {
        if (url === `${process.env.REACT_APP_API_URL_BASE}guestlinks/asset/an_asset_ui_id`) {
          return { guestlinks: [guestLink] };
        }

        throw new Error(`unexpected url: ${url}`);
      });

      // Act
      const guestLinks = await guestLinkProxy.getGuestLinks('an_asset_ui_id');

      // Assert
      expect(httpProxy.get).toHaveBeenCalledTimes(1);
      expect(storageService.setItem).toHaveBeenCalledTimes(1);
      expect(storageService.setItem.mock.calls[0][0]).toEqual(`${process.env.REACT_APP_API_URL_BASE}guestlinks/asset/an_asset_ui_id`);
      expect(guestLinks[0]).toEqual(guestLink);
      done();
    });

    it('should try to get the guest links from the storage since we are offline or unsynced', async (done) => {
      // Arrange
      const guestLink = { data: 'somedata' };

      syncService.isOnlineAndSynced.mockImplementation(async () => Promise.resolve(false));
      storageService.getArray.mockImplementation(async () => [guestLink]);

      // Act
      const guestLinks = await guestLinkProxy.getGuestLinks('an_asset_ui_id');

      // Assert
      expect(storageService.getArray).toHaveBeenCalledTimes(1);
      expect(storageService.getArray.mock.calls[0][0]).toEqual(`${process.env.REACT_APP_API_URL_BASE}guestlinks/asset/an_asset_ui_id`);
      expect(guestLinks[0]).toEqual(guestLink);
      done();
    });
  });

  describe('removeGuestLink', () => {
    it('it should throw an exception if not online', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(false));

      // Act
      try {
        await guestLinkProxy.removeGuestLink('a_guestlink_uiid', 'an_asset_ui_id');
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toBe('mustBeOnlineForSharedLinkDeletion');
        done();
      }
    });

    it('it should throw an exception if the user does not have enough credentials', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: true }));

      // Act
      try {
        await guestLinkProxy.removeGuestLink('a_guestlink_uiid', 'an_asset_ui_id');
      } catch (error) {
        // Assert
        expect(error instanceof HttpError).toBe(true);
        expect(error.data).toEqual({ message: 'credentialError' });
        done();
      }
    });

    it('it should post the expected data to the correct url', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
      httpProxy.deleteReq.mockImplementation(async (url) => {
        if (url === `${process.env.REACT_APP_API_URL_BASE}guestlinks/a_guestlink_uiid`) {
          return { guestlink: { data: 'somedata' } };
        }

        throw new Error('unexpected url');
      });
      storageService.removeItemInArray.mockImplementation(async () => {});

      // Act
      const guestlink = await guestLinkProxy.removeGuestLink('a_guestlink_uiid', 'an_asset_ui_id');

      // Assert
      expect(httpProxy.deleteReq).toHaveBeenCalledTimes(1);
      expect(guestlink).toEqual({ data: 'somedata' });
      done();
    });

    it('it should remove the guestlink into the asset guestlink array in the storage', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      assetManager.getUserCredentials.mockImplementation(() => ({ readonly: false }));
      httpProxy.deleteReq.mockImplementation(async (url) => {
        if (url === `${process.env.REACT_APP_API_URL_BASE}guestlinks/a_guestlink_uiid`) {
          return { guestlink: { _uiId: 'a_guestlink_uiid', data: 'somedata' } };
        }

        throw new Error('unexpected url');
      });
      storageService.removeItemInArray.mockImplementation(async (key, itemId) => {
        if (key === `${process.env.REACT_APP_API_URL_BASE}guestlinks/asset/an_asset_ui_id`) {
          expect(itemId).toEqual('a_guestlink_uiid');
          return Promise.resolve([]);
        }

        throw new Error(`unexpected key: ${key}`);
      });

      // Act
      const guestlink = await guestLinkProxy.removeGuestLink('a_guestlink_uiid', 'an_asset_ui_id');

      // Assert
      expect(httpProxy.deleteReq).toHaveBeenCalledTimes(1);
      expect(storageService.removeItemInArray).toHaveBeenCalledTimes(1);
      expect(guestlink).toEqual({ _uiId: 'a_guestlink_uiid', data: 'somedata' });
      done();
    });
  });

  describe('tryGetAndSetUserFromNiceKey', () => {
    it('should return undefined when offline', async (done) => {
      // Arrange
      syncService.isOnline.mockImplementation(async () => Promise.resolve(false));

      // Act
      const guest = await guestLinkProxy.tryGetAndSetUserFromNiceKey('a_nice_key');

      // Assert
      expect(guest).toBeUndefined();
      done();
    });

    it('should try to get the guest user when online', async (done) => {
      // Arrange
      const guestUser = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      httpProxy.get.mockImplementation(async (url) => {
        if (url === `${process.env.REACT_APP_API_URL_BASE}guestlinks/nicekey/a_nice_key`) {
          return Promise.resolve(
            {
              user: guestUser,
            },
          );
        }

        throw new Error(`Unexpected url ${url}`);
      });

      storageService.openUserStorage.mockReset();

      // Act
      const guest = await guestLinkProxy.tryGetAndSetUserFromNiceKey('a_nice_key');

      // Assert
      expect(guest).toEqual(guestUser);
      expect(httpProxy.setConfig.mock.calls[0][0]).toEqual({ headers: { Authorization: `Token ${guestUser.token}` } });
      expect(storageService.openUserStorage.mock.calls[0][0]).toEqual(guestUser);
      expect(userContext.getCurrentUser()).toEqual(guestUser);

      done();
    });
  });
});
