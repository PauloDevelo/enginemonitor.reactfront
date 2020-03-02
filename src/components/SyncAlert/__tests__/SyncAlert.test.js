import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import SyncAlert from '../SyncAlert';

import ignoredMessages from '../../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService, { SyncContext } from '../../../services/SyncService';
import onlineManager from '../../../services/OnlineManager';
import storageService from '../../../services/StorageService';
import actionManager, { ActionType } from '../../../services/ActionManager';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import httpProxy from '../../../services/HttpProxy';

jest.mock('../../../services/OnlineManager');
jest.mock('../../../services/HttpProxy');

describe('Test SyncAlert', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('Could not find required `intl` object.');
  });

  beforeEach(() => {
    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));
    storageService.openUserStorage({ email: 'pt@something.fr' });

    httpProxy.get.mockImplementation(() => {});
    httpProxy.post.mockImplementation(() => {});
    httpProxy.postImage.mockImplementation(() => {});
    httpProxy.deleteReq.mockImplementation(() => {});
    httpProxy.createCancelTokenSource.mockImplementation(() => ({ token: {} }));
  });

  afterEach(async () => {
    httpProxy.get.mockRestore();
    httpProxy.post.mockRestore();
    httpProxy.postImage.mockRestore();
    httpProxy.deleteReq.mockRestore();
    httpProxy.createCancelTokenSource.mockRestore();

    actionManager.clearActions();
    onlineManager.isOnline.mockRestore();
    storageService.closeUserStorage();
  });

  describe('When synchronizing', () => {
    it('should display the SyncAlert when the synchronisation starts', async (done) => {
      // Arrange

      const action1 = {
        type: ActionType.Post,
        key: 'http://localhost/post/something',
        data: 'anything',
      };

      const action2 = {
        type: ActionType.Delete,
        key: 'http://localhost/delete/something',
        data: 'anything',
      };

      await actionManager.addAction(action1);
      await actionManager.addAction(action2);

      const syncAlertWrapper = mount(<SyncAlert />);
      await updateWrapper(syncAlertWrapper);

      const onSyncContextChanged = jest.fn((syncContext) => {
        updateWrapper(syncAlertWrapper).then(() => {
          const progress = syncAlertWrapper.find('Progress');

          expect(progress.length).toBe(1);
          expect(progress.props().value).toEqual(((syncContext.remainingActionToSync) * 100) / syncContext.totalActionToSync);

          if (syncContext.isSyncing) {
            syncService.unregisterSyncListener(onSyncContextChanged);
            done();
          }
        });
      });
      syncService.registerSyncListener(onSyncContextChanged);

      // Act
      await syncService.synchronize();
      await updateWrapper(syncAlertWrapper);

      // Assert
    });
  });
});
