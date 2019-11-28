import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import userProxy from '../UserProxy';

jest.mock('../HttpProxy');
jest.mock('../StorageService');

describe('Test UserProxy', () => {
  beforeEach(() => {
    storageService.setGlobalItem.mockReset();
    storageService.removeGlobalItem.mockReset();
    storageService.getGlobalItem.mockReset();
    storageService.openUserStorage.mockReset();
    storageService.closeUserStorage.mockReset();

    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
  });

  describe('fetchCurrentUser', () => {
    it('when the user is already authenticated in the storage service, it should set the config into the httpProxy for later request, open the user storage and return the user', async () => {
      // arrange
      const config = { headers: { Authorization: 'Token jwttoken' } };

      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      storageService.getGlobalItem.mockImplementation((key) => {
        if (key === 'EquipmentMonitorServiceProxy.config') {
          return Promise.resolve(config);
        }
        if (key === 'currentUser') {
          return Promise.resolve(user);
        }

        return Promise.resolve(null);
      });

      // act
      const fetchedUser = await userProxy.fetchCurrentUser();

      // assert
      expect(fetchedUser).toEqual(user);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(1);
      expect(storageService.openUserStorage).toHaveBeenCalledTimes(1);
    });

    it('when there the user is not authenticated, it should return undefined and it should remove the config into the httpProxy', async () => {
      // arrange
      const config = undefined;

      storageService.getGlobalItem.mockImplementation((key) => {
        if (key === 'EquipmentMonitorServiceProxy.config') {
          return Promise.resolve(config);
        }

        return Promise.resolve(null);
      });

      // act
      const fetchedUser = await userProxy.fetchCurrentUser();

      // assert
      expect(fetchedUser).toEqual(undefined);
      expect(httpProxy.setConfig).toHaveBeenCalledTimes(1);
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
      expect(storageService.removeGlobalItem).toHaveBeenCalledTimes(2);
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
      expect(storageService.setGlobalItem).toHaveBeenCalledTimes(2);
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
