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

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isRunning: false,
      total: 5,
      remaining: 5,
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

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isRunning: true,
      total: 5,
      remaining: 5,
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

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(<SyncAlert />);
    await updateWrapper(syncAlertWrapper);

    await syncAlertNotifier({
      isRunning: true,
      total: 5,
      remaining: 5,
    });
    await updateWrapper(syncAlertWrapper);

    // Act
    await syncAlertNotifier({
      isRunning: true,
      total: 5,
      remaining: 3,
    });
    await updateWrapper(syncAlertWrapper);

    // Assert
    const progress = syncAlertWrapper.find('Progress');
    expect(progress.props().value).toBe(60);
  });
});
