import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import userProxy from '../UserProxy';
import syncService from '../SyncService';

jest.mock('../HttpProxy');
jest.mock('../StorageService');
jest.mock('../SyncService');

describe('Test UserProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('an error happened');
  });

  afterEach(() => {
    storageService.existGlobalItem.mockReset();
    storageService.setGlobalItem.mockReset();
    storageService.removeGlobalItem.mockReset();
    storageService.getGlobalItem.mockReset();
    storageService.openUserStorage.mockReset();
    storageService.closeUserStorage.mockReset();

    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.get.mockReset();

    syncService.isOnline.mockReset();
  });

  describe('tryGetAndSetMemorizedUser', () => {
    it('when offline and when the user is already authenticated in the storage service, it should set the config into the httpProxy for later request, open the user storage and return the user', async () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      syncService.isOnline.mockImplementation(async () => Promise.resolve(false));

      storageService.getGlobalItem.mockImplementation((key) => Promise.resolve(key === 'currentUser' ? user : null));
      storageService.existGlobalItem.mockImplementation(async (key) => Promise.resolve(key === 'currentUser'));

      // act
      const fetchedUser = await userProxy.tryGetAndSetMemorizedUser();

      // assert
      expect(fetchedUser).toEqual(user);
      expect(httpProxy.get).toHaveBeenCalledTimes(0);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(1);
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
    });

    it('when online and when the user is already authenticated in the storage service, it should get an update of the user, set the config into the httpProxy for later request, open the user storage and return the user', async () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      httpProxy.get.mockImplementation(async () => Promise.resolve({ user }));

      storageService.getGlobalItem.mockImplementation((key) => Promise.resolve(key === 'currentUser' ? user : null));
      storageService.existGlobalItem.mockImplementation(async (key) => Promise.resolve(key === 'currentUser'));

      // act
      const fetchedUser = await userProxy.tryGetAndSetMemorizedUser();

      // assert
      expect(fetchedUser).toEqual(user);
      expect(httpProxy.get).toHaveBeenCalledTimes(1);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(2);
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
    });

    it('when online but the backend irresponsive and when the user is already authenticated in the storage service, it should try to get an update of the user, set the config into the httpProxy for later request, open the user storage and return the user', async () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      syncService.isOnline.mockImplementation(async () => Promise.resolve(true));
      httpProxy.get.mockImplementation(async () => {
        throw new Error('an error happened');
      });

      storageService.getGlobalItem.mockImplementation((key) => Promise.resolve(key === 'currentUser' ? user : null));
      storageService.existGlobalItem.mockImplementation(async (key) => Promise.resolve(key === 'currentUser'));

      // act
      const fetchedUser = await userProxy.tryGetAndSetMemorizedUser();

      // assert
      expect(fetchedUser).toEqual(user);
      expect(httpProxy.get).toHaveBeenCalledTimes(1);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(1);
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
    });

    it('when there the user is not authenticated, it should return undefined and it should remove the config into the httpProxy', async () => {
      // arrange
      storageService.existGlobalItem.mockImplementation(async () => Promise.resolve(false));
      jest.spyOn(httpProxy, 'setConfig');
      jest.spyOn(storageService, 'openUserStorage');

      // act
      const fetchedUser = await userProxy.tryGetAndSetMemorizedUser();

      // assert
      expect(fetchedUser).toEqual(undefined);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(0);
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(0);
    });
  });

  describe('authenticate', () => {
    it('should remove the config in httpProxy, delete global items into storage and close the user storage', async () => {
      // arrange

      // act
      await userProxy.logout();

      // assert
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(1);
      expect(storageService.closeUserStorage).toHaveBeenCalledTimes(1);
      expect(storageService.removeGlobalItem).toHaveBeenCalledTimes(1);
    });

    it('should post the authentification, update the local storage and set the httpProxy config because of the remember flag it true', async () => {
      // Arrange
      const user = {
        email: 'test@jest',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      httpProxy.post.mockImplementationOnce(() => Promise.resolve(
        { user },
      ));

      let currentConfig;
      httpProxy.setConfig.mockImplementation((config) => {
        currentConfig = config;
      });

      const authInfo = { email: 'test@jest', password: 'passwordTest', remember: true };

      // Act
      const authUser = await userProxy.authenticate(authInfo);

      // Assert
      expect(authUser).toEqual(user);
      expect(currentConfig).toEqual({ headers: { Authorization: `Token ${user.token}` } });
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
      expect(storageService.setGlobalItem).toHaveBeenCalledTimes(1);
    });

    it('should not update the local storage because of the remember flag at false but should configure the http proxy and open the user storage.', async () => {
      // Arrange
      const user = {
        email: 'test@jest',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      httpProxy.post.mockImplementationOnce(() => Promise.resolve(
        { user },
      ));

      let currentConfig;
      httpProxy.setConfig.mockImplementation((config) => {
        currentConfig = config;
      });

      const authInfo = { email: 'test@jest', password: 'passwordTest', remember: false };

      // Act
      const authUser = await userProxy.authenticate(authInfo);

      // Assert
      expect(authUser).toEqual(user);
      expect(currentConfig).toEqual({ headers: { Authorization: `Token ${user.token}` } });
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
      expect(storageService.setGlobalItem).toHaveBeenCalledTimes(0);
    });
  });
});
