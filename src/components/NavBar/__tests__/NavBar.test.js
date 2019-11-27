
import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import updateWrapper from '../../../testHelpers/EnzymeHelper';

import actionManager from '../../../services/ActionManager';
import syncService from '../../../services/SyncService';
import timeService from '../../../services/TimeService';
import userContext from '../../../services/UserContext';

import NavBar from '../NavBar';

jest.mock('localforage');
jest.mock('../../../services/ActionManager');
jest.mock('../../../services/UserContext');
jest.mock('../../../services/TimeService');
jest.mock('../../../services/SyncService');

describe('Component NavBar', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('Missing message:');
  });

  beforeEach(() => {
    jest.spyOn(syncService, 'synchronize');
    jest.spyOn(syncService, 'registerIsOnlineListener');
    jest.spyOn(syncService, 'unregisterIsOnlineListener');

    jest.spyOn(actionManager, 'registerOnActionManagerChanged');
    jest.spyOn(actionManager, 'unregisterOnActionManagerChanged');

    jest.spyOn(userContext, 'unregisterOnUserStorageSizeChanged');
    jest.spyOn(userContext, 'unregisterOnUserChanged');

    jest.spyOn(timeService, 'getUTCDateTime').mockImplementation(() => new Date(2019, 10, 27, 7, 54));
  });

  afterEach(() => {
    timeService.getUTCDateTime.mockRestore();

    userContext.getCurrentUser.mockRestore();

    userContext.registerOnUserChanged.mockRestore();
    userContext.unregisterOnUserChanged.mockRestore();

    userContext.registerOnUserStorageSizeChanged.mockRestore();
    userContext.unregisterOnUserStorageSizeChanged.mockRestore();

    syncService.registerIsOnlineListener.mockRestore();
    syncService.unregisterIsOnlineListener.mockRestore();

    syncService.isOnline.mockRestore();
    syncService.synchronize.mockRestore();
    syncService.isOfflineModeActivated.mockRestore();

    actionManager.registerOnActionManagerChanged.mockRestore();
    actionManager.unregisterOnActionManagerChanged.mockRestore();

    actionManager.countAction.mockRestore();
  });

  it('should render the navbar even when the user is still undefined', async () => {
    // Arrange
    jest.spyOn(syncService, 'isOnline').mockImplementation(() => true);
    jest.spyOn(actionManager, 'countAction').mockImplementation(async () => Promise.resolve(0));

    jest.spyOn(userContext, 'getCurrentUser').mockImplementation(() => undefined);

    let onUserChanged;
    jest.spyOn(userContext, 'registerOnUserChanged').mockImplementation((onUserChangedFn) => { onUserChanged = onUserChangedFn; });

    let onUserStorageSizeChanged;
    jest.spyOn(userContext, 'registerOnUserStorageSizeChanged').mockImplementation((onUserStorageSizeChangedFn) => { onUserStorageSizeChanged = onUserStorageSizeChangedFn; });

    jest.spyOn(syncService, 'isOfflineModeActivated').mockImplementation(() => false);

    const onLoggedOut = jest.fn();
    const toggle = jest.fn();

    // Act
    const wrapper = mount(<IntlProvider locale={navigator.language}><NavBar onLoggedOut={onLoggedOut} isOpened toggle={toggle} /></IntlProvider>);
    await updateWrapper(wrapper);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(userContext.registerOnUserChanged).toBeCalledTimes(1);
    expect(userContext.registerOnUserStorageSizeChanged).toBeCalledTimes(1);

    wrapper.unmount();
    expect(userContext.unregisterOnUserStorageSizeChanged).toBeCalledTimes(1);
    expect(userContext.unregisterOnUserChanged.mock.calls[0][0]).toBe(onUserChanged);
    expect(userContext.unregisterOnUserStorageSizeChanged).toBeCalledTimes(1);
    expect(userContext.unregisterOnUserStorageSizeChanged.mock.calls[0][0]).toBe(onUserStorageSizeChanged);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);
  });

  it('should open the modal about when the user click on the about button', async () => {
    // Arrange
    jest.spyOn(syncService, 'isOnline').mockImplementation(() => true);
    jest.spyOn(actionManager, 'countAction').mockImplementation(async () => Promise.resolve(0));

    jest.spyOn(userContext, 'getCurrentUser').mockImplementation(() => undefined);

    jest.spyOn(userContext, 'registerOnUserChanged');

    jest.spyOn(userContext, 'registerOnUserStorageSizeChanged');

    jest.spyOn(syncService, 'isOfflineModeActivated').mockImplementation(() => false);

    const onLoggedOut = jest.fn();
    const toggle = jest.fn();

    const wrapper = mount(<IntlProvider locale={navigator.language}><NavBar onLoggedOut={onLoggedOut} isOpened toggle={toggle} /></IntlProvider>);
    await updateWrapper(wrapper);

    const dropdownItemAbout = wrapper.find('DropdownItem').at(7);

    // Act
    dropdownItemAbout.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.props().visible).toBe(true);
  });
});
