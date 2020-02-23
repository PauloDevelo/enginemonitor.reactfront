import React from 'react';
import { mount } from 'enzyme';

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
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    guestLinkProxy.getGuestLinks.mockRestore();
    guestLinkProxy.createGuestLink.mockRestore();
    guestLinkProxy.removeGuestLink.mockRestore();
  });

  it('should try to get the link when the component loads and then display it', async (done) => {
    // Arrange
    const guestLink = { _uiId: 'uiidforthefrontend', name: 'guest', niceKey: 'thisisanicekey' };
    guestLinkProxy.getGuestLinks.mockImplementation(async (assetUiId) => {
      if (assetUiId === asset._uiId) {
        return Promise.resolve([guestLink]);
      }

      throw new Error('unexpected assed ui id');
    });

    // Act
    const wrapper = mount(<GuestLink asset={asset} />);
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe(`http://test/${guestLink.niceKey}`);

    done();
  });

  it('should display a empty link if guestLinkProxy.getGuestLinks throw an exception', async (done) => {
    // Arrange
    guestLinkProxy.getGuestLinks.mockImplementation(async () => {
      throw new Error('unexpected assed ui id');
    });

    const onError = jest.fn();

    // Act
    const wrapper = mount(<GuestLink asset={asset} onError={onError} />);
    await updateWrapper(wrapper);

    // Assert
    expect(guestLinkProxy.getGuestLinks).toBeCalledTimes(1);
    const input = wrapper.find('Input');
    expect(input.get(0).props.value).toBe('');

    expect(onError).toBeCalledTimes(0);

    done();
  });

  it('should try to create a guest link when clicking on the button and when there is no guest link created yet', async (done) => {
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

    const wrapper = mount(<GuestLink asset={asset} />);
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

    done();
  });

  it('should call onError when creating a guest link fails', async (done) => {
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

    const wrapper = mount(<GuestLink asset={asset} onError={onError} />);
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

    done();
  });

  it('should try to delete a guest link when clicking on the button because there is already a guest link created', async (done) => {
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

    const wrapper = mount(<GuestLink asset={asset} />);
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

    done();
  });

  it('should call onError when delete throws an unexpected error.', async (done) => {
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

    const wrapper = mount(<GuestLink asset={asset} onError={onError} />);
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

    done();
  });

  it('should copy the link in the clipboard when the guest link input gets the focus', async (done) => {
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

    const wrapper = mount(<GuestLink asset={asset} />);
    await updateWrapper(wrapper);

    const input = wrapper.find('Input');

    // Act
    input.simulate('focus');
    await updateWrapper(wrapper);

    // Assert
    expect(lastCommand).toBe('copy');

    done();
  });
});
