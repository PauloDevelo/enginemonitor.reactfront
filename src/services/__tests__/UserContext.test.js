import { doesNotReject } from 'assert';
import ignoredMessages from '../../testHelpers/MockConsole';
import userContext from '../UserContext';

describe('Test UserContext', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('getCurrentUser', () => {
    it('At the beginning the user is undefined...', async () => {
      // arrange

      // act
      const currentUser = userContext.getCurrentUser();

      // assert
      expect(currentUser).toBeUndefined();
    });

    it('Then, once we get a notification onUserChanged, the current user is memorized', async () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      userContext.onUserChanged(user);

      // act
      const currentUser = userContext.getCurrentUser();

      // assert
      expect(currentUser).toEqual(user);
    });
  });

  describe('registerOnUserChanged', () => {
    it('Once we get a notification onUserChanged, we broadcast the change', async () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      userContext.registerOnUserChanged(listener1);
      userContext.registerOnUserChanged(listener2);

      // act
      userContext.onUserChanged(user);

      // assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener1.mock.calls[0][0]).toEqual(user);
      expect(listener2.mock.calls[0][0]).toEqual(user);
    });

    it('Once we get a notification onUserChanged, we broadcast the change only on the listener still registered', async () => {
      // arrange
      const user1 = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
      };

      const user2 = {
        email: 'test2@axios',
        firstname: 'jest2',
        name: 'react2',
        token: 'jwt2',
      };

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      userContext.registerOnUserChanged(listener1);
      userContext.registerOnUserChanged(listener2);

      userContext.onUserChanged(user1);

      userContext.unregisterOnUserChanged(listener1);

      // act
      userContext.onUserChanged(user2);

      // assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(2);
      expect(listener1.mock.calls[0][0]).toEqual(user1);
      expect(listener2.mock.calls[0][0]).toEqual(user1);
      expect(listener2.mock.calls[1][0]).toEqual(user2);
    });
  });

  describe('onImageAdded / onImageDeleted', () => {
    it("Once we get a notification onImageAdded, we increment the user's image folder size", () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
        imageFolderSizeInByte: 0,
      };

      userContext.onUserChanged(user);

      // act
      userContext.onImageAdded(100);

      // assert
      expect(userContext.getCurrentUser().imageFolderSizeInByte).toEqual(100);
    });

    it("Once we get a notification onImageDeleted, we decrement the user's image folder size", () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
        imageFolderSizeInByte: 500,
      };

      userContext.onUserChanged(user);

      // act
      userContext.onImageRemoved(100);

      // assert
      expect(userContext.getCurrentUser().imageFolderSizeInByte).toEqual(400);
    });

    it('Once we get a notification onImageAdded, because the user is undefined we do nothing', (done) => {
      // arrange
      userContext.onUserChanged(undefined);

      // act
      userContext.onImageAdded(100);

      // assert
      done();
    });

    it('Once we get a notification onImageDeleted, because the user is undefined we do nothing', (done) => {
      // arrange
      userContext.onUserChanged(undefined);

      // act
      userContext.onImageRemoved(100);

      // assert
      done();
    });

    it('should broadcast the user image folder size each time it changes', () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
        imageFolderSizeInByte: 500,
      };

      userContext.onUserChanged(user);

      const listener = jest.fn();
      userContext.registerOnUserStorageSizeChanged(listener);

      // act
      userContext.onImageRemoved(100);

      // assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toEqual(400);
    });

    it('should broadcast the user image folder size each time it changes', () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
        imageFolderSizeInByte: 500,
      };

      userContext.onUserChanged(user);

      const listener = jest.fn();
      userContext.registerOnUserStorageSizeChanged(listener);

      // act
      userContext.onImageAdded(100);

      // assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toEqual(600);
    });

    it('should broadcast the user image folder size only on the listener subscribe', () => {
      // arrange
      const user = {
        email: 'test@axios',
        firstname: 'jest',
        name: 'react',
        token: 'jwt',
        imageFolderSizeInByte: 500,
      };

      userContext.onUserChanged(user);

      const listener = jest.fn();
      const listener2 = jest.fn();
      userContext.registerOnUserStorageSizeChanged(listener);
      userContext.registerOnUserStorageSizeChanged(listener2);

      // act
      userContext.onImageAdded(100);
      userContext.unregisterOnUserStorageSizeChanged(listener2);
      userContext.onImageRemoved(100);

      // assert
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[0][0]).toEqual(600);
      expect(listener.mock.calls[1][0]).toEqual(500);

      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener2.mock.calls[0][0]).toEqual(600);
    });
  });
});
