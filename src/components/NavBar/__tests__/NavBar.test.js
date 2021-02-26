import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import updateWrapper from '../../../testHelpers/EnzymeHelper';

import actionManager from '../../../services/ActionManager';
import syncService from '../../../services/SyncService';
import onlineManager from '../../../services/OnlineManager';
import timeService from '../../../services/TimeService';
import userProxy from '../../../services/UserProxy';
import assetProxy from '../../../services/AssetProxy';
import localStorageBuilder from '../../../services/LocalStorageBuilder';

import userContext from '../../../services/UserContext';

import NavBar from '../NavBar';

jest.mock('localforage');
jest.mock('../../../services/ActionManager');
jest.mock('../../../services/TimeService');
jest.mock('../../../services/SyncService');
jest.mock('../../../services/UserProxy');
jest.mock('../../../services/AssetProxy');
jest.mock('../../../services/OnlineManager');
jest.mock('../../../services/LocalStorageBuilder');

describe('Component NavBar', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('MISSING_TRANSLATION');
    ignoredMessages.push('Missing message:');
  });

  beforeEach(() => {
    timeService.getUTCDateTime.mockImplementation(() => new Date('2019-11-26T23:54:00.000Z'));

    syncService.tryToRun.mockImplementation(async () => Promise.resolve());

    onlineManager.registerIsOnlineListener.mockImplementation(() => {});
    onlineManager.unregisterIsOnlineListener.mockImplementation(() => {});
    onlineManager.isOnline.mockImplementation(() => Promise.resolve(true));
    onlineManager.isOfflineModeActivated.mockImplementation(() => false);

    actionManager.registerOnActionManagerChanged.mockImplementation(() => {});
    actionManager.unregisterOnActionManagerChanged.mockImplementation(() => {});
    actionManager.countAction.mockImplementation(() => 0);

    assetProxy.fetchAssets.mockImplementation(async () => Promise.resolve([{
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    }]));

    assetProxy.existAsset.mockImplementation(async (assetId) => Promise.resolve(assetId === 'asset_01'));
  });

  afterEach(() => {
    timeService.getUTCDateTime.mockRestore();

    syncService.tryToRun.mockRestore();

    onlineManager.registerIsOnlineListener.mockRestore();
    onlineManager.unregisterIsOnlineListener.mockRestore();
    onlineManager.isOnline.mockRestore();
    onlineManager.isOfflineModeActivated.mockRestore();

    actionManager.registerOnActionManagerChanged.mockRestore();
    actionManager.unregisterOnActionManagerChanged.mockRestore();
    actionManager.countAction.mockRestore();

    userProxy.logout.mockRestore();
    userProxy.getCredentials.mockRestore();

    assetProxy.fetchAssets.mockRestore();
    assetProxy.existAsset.mockRestore();

    localStorageBuilder.tryToRun.mockRestore();
  });

  it('should render the navbar even when the user is still undefined', async () => {
    // Arrange
    // Act
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    // Assert
    expect(wrapper).toMatchSnapshot();

    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(false);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);

    wrapper.unmount();
  });

  it('should trigger the local storage rebuild when we click on the rebuild dropdown item', async () => {
    // Arrange
    localStorageBuilder.tryToRun.mockImplementation(async () => {});

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const dropdownItemRebuildLocalStorage = wrapper.find('DropdownItem').at(5);

    // Act
    dropdownItemRebuildLocalStorage.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    expect(localStorageBuilder.tryToRun).toBeCalledTimes(1);
  });

  it('should open the modal about when the user click on the about button', async () => {
    // Arrange
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const dropdownItemAbout = wrapper.find('DropdownItem').at(9);

    // Act
    dropdownItemAbout.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.props().visible).toBe(true);
  });

  it('should toggle the navbar when the user click on the navbar button', async () => {
    // Arrange
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const navBarButton = wrapper.find('NavbarToggler');

    // Act
    navBarButton.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(true);
  });

  it('should re-render the navbar when the user changed', async () => {
    // Arrange
    jest.spyOn(userProxy, 'getCredentials').mockImplementation(() => Promise.resolve({ readonly: false }));

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const user = {
      _uiId: 'user_01',
      name: 'torruella',
      email: 'test@axios',
      firstname: 'paul',
      imageFolderSizeInByte: 1000,
      imageFolderSizeLimitInByte: 10000,
    };

    // Act
    userContext.onUserChanged(user);
    await updateWrapper(wrapper);

    // Assert
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(false);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);

    const dropdownToggle = wrapper.find('DropdownToggle').at(0);
    expect(dropdownToggle.text()).toBe(user.email);

    const imageFolderGauge = wrapper.find('Memo(ImageFolderGauge)');
    expect(imageFolderGauge.props()).toEqual({ storageSizeInMB: (1000 / 1048576), storageSizeLimitInMB: (10000 / 1048576) });
  });

  it('should re-render the navbar when the user add an image', async () => {
    // Arrange
    jest.spyOn(userProxy, 'getCredentials').mockImplementation(() => Promise.resolve({ readonly: false }));

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const user = {
      _uiId: 'user_01',
      name: 'torruella',
      email: 'test@axios',
      firstname: 'paul',
      imageFolderSizeInByte: 1000,
      imageFolderSizeLimitInByte: 10000,
    };

    userContext.onUserChanged(user);
    await updateWrapper(wrapper);

    // Act
    userContext.onImageAdded(100);
    await updateWrapper(wrapper);

    // Assert
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(false);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);

    const dropdownToggle = wrapper.find('DropdownToggle').at(0);
    expect(dropdownToggle.text()).toBe(user.email);

    const imageFolderGauge = wrapper.find('Memo(ImageFolderGauge)');
    expect(imageFolderGauge.props()).toEqual({ storageSizeInMB: (1100 / 1048576), storageSizeLimitInMB: (10000 / 1048576) });
  });

  it('should re-render the navbar when the user removed an image', async () => {
    // Arrange
    jest.spyOn(userProxy, 'getCredentials').mockImplementation(() => Promise.resolve({ readonly: false }));

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const user = {
      _uiId: 'user_01',
      name: 'torruella',
      email: 'test@axios',
      firstname: 'paul',
      imageFolderSizeInByte: 1000,
      imageFolderSizeLimitInByte: 10000,
    };

    userContext.onUserChanged(user);
    await updateWrapper(wrapper);

    // Act
    userContext.onImageRemoved(100);
    await updateWrapper(wrapper);

    // Assert
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(false);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);

    const dropdownToggle = wrapper.find('DropdownToggle').at(0);
    expect(dropdownToggle.text()).toBe(user.email);

    const imageFolderGauge = wrapper.find('Memo(ImageFolderGauge)');
    expect(imageFolderGauge.props()).toEqual({ storageSizeInMB: (900 / 1048576), storageSizeLimitInMB: (10000 / 1048576) });
  });

  it('should logout when the user clicks on logout', async () => {
    // Arrange
    jest.spyOn(userProxy, 'logout').mockImplementation(() => userContext.onUserChanged(undefined));
    jest.spyOn(userProxy, 'getCredentials').mockImplementation(() => Promise.resolve({ readonly: false }));

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><NavBar /></IntlProvider>);
    await updateWrapper(wrapper);

    const user = {
      _uiId: 'user_01',
      name: 'torruella',
      email: 'test@axios',
      firstname: 'paul',
      imageFolderSizeInByte: 1000,
      imageFolderSizeLimitInByte: 10000,
    };

    userContext.onUserChanged(user);
    await updateWrapper(wrapper);

    // Act
    const logoutButton = wrapper.find('DropdownItem').at(7);
    logoutButton.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().isOpen).toBe(false);

    const modalAbout = wrapper.find('ModalAbout');
    expect(modalAbout.length).toBe(0);

    const dropdownToggle = wrapper.find('DropdownToggle').at(0);
    expect(dropdownToggle.text()).toBe('Login');

    const imageFolderGauge = wrapper.find('Memo(ImageFolderGauge)');
    expect(imageFolderGauge.props()).toEqual({ storageSizeInMB: 0, storageSizeLimitInMB: 0 });

    expect(userProxy.logout).toHaveBeenCalledTimes(1);
  });
});
