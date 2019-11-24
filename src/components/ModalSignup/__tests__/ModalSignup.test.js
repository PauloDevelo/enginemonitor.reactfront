import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import userProxy from '../../../services/UserProxy';

import ModalSignup from '../ModalSignup';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import HttpError from '../../../http/HttpError';

jest.mock('../../../services/UserProxy');
jest.mock('localforage');

describe('ModalSignup', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    userProxy.signup.mockReset();
  });

  const user = {
    _uiId: 'user_01',
    name: 'torruella',
    email: 'paulodevelo@lovestreet.com',
    password: 'mypassword',
    firstname: 'paul',
    imageFolderSizeInByte: 1234,
    imageFolderSizeLimitInByte: 10000,
  };

  it('should render the ModalSignup', async () => {
    // Arrange
    let signupVisible = false;
    const toggle = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    // Act
    const modalSignup = mount(<ModalSignup visible toggle={toggle} />);
    await updateWrapper(modalSignup);

    // Assert
    expect(modalSignup).toMatchSnapshot();
    expect(modalSignup.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalSignup.find('Alerts');
    expect(alerts.length).toBe(0);
  });
});
