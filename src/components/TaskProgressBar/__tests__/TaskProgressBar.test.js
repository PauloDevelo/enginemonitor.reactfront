import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount } from 'enzyme';

import TaskProgressBar from '../TaskProgressBar';

import ignoredMessages from '../../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import syncService from '../../../services/SyncService';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/SyncService');

describe('Test TaskProgressBar', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('[@formatjs/intl Error MISSING_TRANSLATION]');
  });

  it('should hide the TaskProgressBar when the task is stopped', async () => {
    // Arrange
    let syncAlertNotifier;
    syncService.registerListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(<TaskProgressBar taskWithProgress={syncService} color="warning" title="syncInProgress" />);
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
    syncService.registerListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <TaskProgressBar taskWithProgress={syncService} color="warning" title="syncInProgress" />
      </IntlProvider>,
    );
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
    syncService.registerListener.mockImplementation((listener) => {
      syncAlertNotifier = listener;
    });

    syncService.getContext.mockImplementation(() => ({
      isRunning: false,
      total: 0,
      remaining: 0,
    }));

    const syncAlertWrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <TaskProgressBar taskWithProgress={syncService} color="warning" title="syncInProgress" />
      </IntlProvider>,
    );
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
