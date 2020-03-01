import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import actionManager from '../../../services/ActionManager';
import syncService from '../../../services/SyncService';
import onlineManager from '../../../services/OnlineManager';

import DropDownConnectionStateItem from '../DropDownConnectionStateItem';

import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('localforage');
jest.mock('../../../services/ActionManager');
jest.mock('../../../services/SyncService');
jest.mock('../../../services/OnlineManager');

describe('DropDownConnectionStateItem', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('Could not find required `intl` object.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  beforeEach(() => {
    jest.spyOn(onlineManager, 'registerIsOnlineListener');
    jest.spyOn(onlineManager, 'unregisterIsOnlineListener');

    jest.spyOn(actionManager, 'registerOnActionManagerChanged');
    jest.spyOn(actionManager, 'unregisterOnActionManagerChanged');
  });

  afterEach(async () => {
    onlineManager.registerIsOnlineListener.mockRestore();
    onlineManager.unregisterIsOnlineListener.mockRestore();
    onlineManager.isOnline.mockRestore();
    syncService.synchronize.mockRestore();

    actionManager.registerOnActionManagerChanged.mockRestore();
    actionManager.unregisterOnActionManagerChanged.mockRestore();
    actionManager.countAction.mockRestore();
  });

  const states = [
    { isOnline: true, nbAction: 0 },
    { isOnline: true, nbAction: 3 },
    { isOnline: false, nbAction: 0 },
    { isOnline: false, nbAction: 5 },
  ];
  describe.each(states)('Render', ({ isOnline, nbAction }) => {
    it(`Should render when the app is online ${isOnline} and nb action is ${nbAction} as expected `, async (done) => {
      // Arrange
      jest.spyOn(onlineManager, 'isOnline').mockImplementation(async () => Promise.resolve(isOnline));
      jest.spyOn(syncService, 'synchronize');
      jest.spyOn(actionManager, 'countAction').mockImplementation(async () => Promise.resolve(nbAction));

      // Act
      const dropDownConnectionStateItemWrapper = mount(<DropDownConnectionStateItem />);
      await updateWrapper(dropDownConnectionStateItemWrapper);

      // Assert
      expect(dropDownConnectionStateItemWrapper).toMatchSnapshot();
      expect(onlineManager.registerIsOnlineListener).toBeCalledTimes(1);
      expect(actionManager.registerOnActionManagerChanged).toBeCalledTimes(2);

      dropDownConnectionStateItemWrapper.unmount();
      expect(onlineManager.unregisterIsOnlineListener).toBeCalledTimes(1);
      expect(actionManager.unregisterOnActionManagerChanged).toBeCalledTimes(2);
      done();
    });
  });
});
