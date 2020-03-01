import ignoredMessages from '../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import actionManager from '../ActionManager';
import httpProxy from '../HttpProxy';
import onlineManager from '../OnlineManager';

jest.mock('../ActionManager');
jest.mock('../HttpProxy');

describe('Test OnlineManager', () => {
  let isOnlineGetter;

  beforeEach(() => {
    isOnlineGetter = jest.spyOn(window.navigator, 'onLine', 'get');
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
    ignoredMessages.push('something wrong happened');
  });

  afterEach(async () => {
    isOnlineGetter.mockRestore();
    actionManager.countAction.mockRestore();
    httpProxy.get.mockRestore();
  });

  const isOnlineParams = [
    {
      isOnline: true, offlineMode: false, pong: true, expectedIsOnLineResult: true,
    },
    {
      isOnline: true, offlineMode: true, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: false, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: true, pong: true, expectedIsOnLineResult: false,
    },
    {
      isOnline: true, offlineMode: false, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: true, offlineMode: true, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: false, pong: false, expectedIsOnLineResult: false,
    },
    {
      isOnline: false, offlineMode: true, pong: false, expectedIsOnLineResult: false,
    },
  ];
  describe.each(isOnlineParams)('isOnline', ({
    isOnline, offlineMode, pong, expectedIsOnLineResult,
  }) => {
    it(`When the browser detects internet is ${isOnline}, and offline mode is ${offlineMode} and the backend ping return ${pong} the online manager should return isOnline ${expectedIsOnLineResult}`, async () => {
      // Arrange
      httpProxy.get.mockImplementation(async () => Promise.resolve({ pong }));
      onlineManager.rebuild();
      actionManager.countAction.mockImplementation(async () => Promise.resolve(0));
      isOnlineGetter.mockReturnValue(isOnline);
      onlineManager.setOfflineMode(offlineMode);

      // Act
      const isOnlineReturned = await onlineManager.isOnline();

      // Assert
      expect(isOnlineReturned).toBe(expectedIsOnLineResult);
    });
  });

  const isSyncedParams = [
    { nbAction: 0, expectedIsSynced: true },
    { nbAction: 15, expectedIsSynced: false },
  ];
  describe.each(isSyncedParams)('isSynced', ({ nbAction, expectedIsSynced }) => {
    it(`When the action manager has ${nbAction} to sync, isSynced should be ${expectedIsSynced}`, async () => {
      // Arrange
      const pong = true;
      httpProxy.get.mockImplementation(async () => Promise.resolve({ pong }));
      onlineManager.rebuild();
      actionManager.countAction.mockImplementation(async () => Promise.resolve(nbAction));

      // Act
      const isSyncedReturned = await onlineManager.isSynced();

      // Assert
      expect(isSyncedReturned).toBe(expectedIsSynced);
    });
  });

  const isOnlineAndSyncedParams = [
    {
      isOnline: true, offlineMode: false, nbAction: 0, expectedIsOnLineAndSyncedResult: true,
    },
    {
      isOnline: true, offlineMode: true, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: false, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: true, nbAction: 0, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: true, offlineMode: false, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: true, offlineMode: true, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: false, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
    {
      isOnline: false, offlineMode: true, nbAction: 15, expectedIsOnLineAndSyncedResult: false,
    },
  ];
  describe.each(isOnlineAndSyncedParams)('isOnlineAndSynced', ({
    isOnline, offlineMode, nbAction, expectedIsOnLineAndSyncedResult,
  }) => {
    it(`When the browser detects internet is ${isOnline}, and offline mode is ${offlineMode} and the action manager has ${nbAction} actions to sync, the onlineManager should return isOnlineAndSync to be ${expectedIsOnLineAndSyncedResult}`, async () => {
      // Arrange
      httpProxy.get.mockImplementation(async () => Promise.resolve({ pong: true }));
      onlineManager.rebuild();
      jest.spyOn(actionManager, 'countAction').mockImplementation(() => Promise.resolve(nbAction));

      isOnlineGetter.mockReturnValue(isOnline);
      onlineManager.setOfflineMode(offlineMode);

      // Act
      const isOnlineAndSyncedReturned = await onlineManager.isOnlineAndSynced();

      // Assert
      expect(isOnlineAndSyncedReturned).toBe(expectedIsOnLineAndSyncedResult);
    });
  });
});
