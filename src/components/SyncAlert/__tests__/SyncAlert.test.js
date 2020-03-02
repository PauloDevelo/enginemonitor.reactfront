import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import SyncAlert from '../SyncAlert';

import ignoredMessages from '../../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService, { SyncContext } from '../../../services/SyncService';
import onlineManager from '../../../services/OnlineManager';
import storageService from '../../../services/StorageService';
import actionManager, { NoActionPendingError, ActionType } from '../../../services/ActionManager';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ActionManager');
jest.mock('../../../services/OnlineManager');
jest.mock('../../../services/StorageService');
jest.mock('localforage');

describe('Test SyncAlert', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('Could not find required `intl` object.');
  });

  beforeEach(() => {
    storageService.isUserStorageOpened.mockImplementation(() => true);
    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));
  });

  afterEach(async () => {
    actionManager.getNextActionToPerform.mockRestore();
    actionManager.countAction.mockRestore();
    actionManager.performAction.mockRestore();
    actionManager.putBackAction.mockRestore();

    onlineManager.isOnline.mockRestore();
    storageService.isUserStorageOpened.mockRestore();
  });

  describe('When synchronizing', () => {
    it('should display the SyncAlert when the synchronisation starts', async (done) => {
      // Arrange
      actionManager.countAction.mockImplementation(() => 2);

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

      actionManager.getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action1));
      actionManager.getNextActionToPerform.mockImplementationOnce(() => Promise.resolve(action2));
      actionManager.getNextActionToPerform.mockImplementationOnce(() => { throw new NoActionPendingError(); });

      const syncAlertWrapper = mount(<SyncAlert />);
      await updateWrapper(syncAlertWrapper);

      let nbActionPerformed = 0;
      actionManager.performAction.mockImplementation(async () => {
        nbActionPerformed++;
        await updateWrapper(syncAlertWrapper);
        const progress = syncAlertWrapper.find('Progress');

        if (progress.length === 1) {
          expect(progress.props().value).toEqual(((2 - nbActionPerformed + 1) * 100) / 2);
          return Promise.resolve();
        }

        return Promise.reject(new Error());
      });

      // Act
      await syncService.synchronize();
      await updateWrapper(syncAlertWrapper);

      // Assert
      expect(nbActionPerformed).toEqual(2);
      // expect(syncAlertWrapper.find('Progress').length).toBe(0);
      done();
    });
  });
});
