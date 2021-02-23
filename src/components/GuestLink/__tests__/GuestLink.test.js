import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import GuestLink from '../GuestLink';

import guestLinkProxy from '../../../services/GuestLinkProxy';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/GuestLinkProxy');
jest.mock('localforage');

describe('Component GuestLink', () => {
  const asset = {
    _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrop', manufactureDate: new Date(2019, 6, 10),
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('Error: [@formatjs/intl Error MISSING_TRANSLATION]');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    guestLinkProxy.getGuestLinks.mockRestore();
    guestLinkProxy.createGuestLink.mockRestore();
    guestLinkProxy.removeGuestLink.mockRestore();
  });

  it('should try to get the link when the component loads and then display it', async () => {
    // Arrange
    const guestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([guestLink]);
      }

      throw new Error('unexpected assed ui id');
    });

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe(`http://test/${guestLink.niceKey}`);
  });

  it('should display a empty link if guestLinkProxy.getGuestLinks throw an exception', async () => {
    // Arrange
    guestLinkProxy.getGuestLinks.mockImplementation(async () => {
      throw new Error('unexpected assed ui id');
    });

    const onError = jest.fn();

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} onError={onError} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe('');

    expect(onError).toBeCalledTimes(0);
  });

  it('should try to create a guest link when clicking on the button and when there is no guest link created yet', async () => {
    // Arrange
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([]);
      }

      throw new Error('unexpected assed ui id');
    });

    const newGuestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.createGuestLink.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve(newGuestLink);
      }

      throw new Error('unexpected assed ui id');
    });

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    const button = wrapper.find('Button');

    // Act
    button.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    expect(guestLinkProxy.createGuestLink).toBeCalledTimes(1);

    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe(`http://test/${newGuestLink.niceKey}`);
  });

  it('should call onError when creating a guest link fails', async () => {
    // Arrange
    const onError = jest.fn();

    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([]);
      }

      throw new Error('unexpected assed ui id');
    });

    guestLinkProxy.createGuestLink.mockImplementation(async () => {
      throw new Error('unexpected exception');
    });

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} onError={onError} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    const button = wrapper.find('Button');

    // Act
    button.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    expect(guestLinkProxy.createGuestLink).toBeCalledTimes(1);

    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe('');
    expect(onError).toBeCalledTimes(1);
  });

  it('should try to delete a guest link when clicking on the button because there is already a guest link created', async () => {
    // Arrange
    const guestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([guestLink]);
      }

      throw new Error('unexpected assed ui id');
    });

    guestLinkProxy.removeGuestLink.mockImplementation(async (guestLinkUiId, assetUiId) => {
      if (assetUiId === asset._uiId && guestLinkUiId === guestLink._uiId) {
        return Promise.resolve(guestLink);
      }

      throw new Error('unexpected assed ui id');
    });

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    const button = wrapper.find('Button');

    // Act
    button.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    expect(guestLinkProxy.removeGuestLink).toBeCalledTimes(1);

    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe('');
  });

  it('should call onError when delete throws an unexpected error.', async () => {
    // Arrange
    const onError = jest.fn();

    const guestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([guestLink]);
      }

      throw new Error('unexpected assed ui id');
    });

    guestLinkProxy.removeGuestLink.mockImplementation(async () => {
      throw new Error('unexpected error');
    });

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} onError={onError} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    const button = wrapper.find('Button');

    // Act
    button.simulate('click');
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    expect(guestLinkProxy.removeGuestLink).toBeCalledTimes(1);
    expect(onError).toBeCalledTimes(1);

    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe(`http://test/${guestLink.niceKey}`);
  });

  it('should copy the link in the clipboard when the guest link input gets the focus', async () => {
    // Arrange
    let lastCommand;
    document.execCommand = (command) => {
      if (command !== 'copy') {
        throw new Error('Unexpected command');
      }

      lastCommand = command;
      return true;
    };

    const guestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([guestLink]);
      }

      throw new Error('unexpected assed ui id');
    });

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <GuestLink asset={asset} />
      </IntlProvider>,
    );
    await updateWrapper(wrapper);

    const input = wrapper.find('Input');

    // Act
    input.simulate('focus');
    await updateWrapper(wrapper);

    // Assert
    expect(lastCommand).toBe('copy');
  });
});
