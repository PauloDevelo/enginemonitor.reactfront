import React from 'react';
import { mount } from 'enzyme';

import SyncAlert from '../SyncAlert';

import ignoredMessages from '../../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService from '../../../services/SyncService';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/SyncService');

describe('Test SyncAlert', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('Could not find required `intl` object.');
  });

  it('should hide the SyncAlert when the synchronisation stops', async () => {
    // Arrange
    let syncAlertNotifier;
    syncService.registerSyncListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isSyncing: false,
      totalActionToSync: 5,
      remainingActionToSync: 5,
    });
    await updateWrapper(syncAlertWrapper);

    // Assert
    const progress = syncAlertWrapper.find('Progress');
    expect(progress.length).toBe(0);
  });

  it('should display the SyncAlert when the synchronisation starts', async () => {
    // Arrange
    let syncAlertNotifier;
    syncService.registerSyncListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isSyncing: true,
      totalActionToSync: 5,
      remainingActionToSync: 5,
    });
    await updateWrapper(syncAlertWrapper);

    // Assert
    const progress = syncAlertWrapper.find('Progress');
    expect(progress.props().value).toBe(100);
  });

  it('should display the progress when the synchronisation is running', async () => {
    // Arrange
    let syncAlertNotifier;
    syncService.registerSyncListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    await syncAlertNotifier({
      isSyncing: true,
      totalActionToSync: 5,
      remainingActionToSync: 5,
    });
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isSyncing: true,
      totalActionToSync: 5,
      remainingActionToSync: 3,
    });
    await updateWrapper(syncAlertWrapper);

    // Assert
    const progress = syncAlertWrapper.find('Progress');
    expect(progress.props().value).toBe(60);
  });
});
