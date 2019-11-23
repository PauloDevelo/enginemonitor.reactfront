import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import userProxy from '../../../services/UserProxy';

import ModalLogin from '../ModalLogin';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/UserProxy');
jest.mock('localforage');

describe('ModalLogin', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    userProxy.sendVerificationEmail.mockReset();
    userProxy.authenticate.mockReset();
  });


  it('should render the ModalLogin', async () => {
    // Arrange
    let isVisible = true;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });
    const onLoggedIn = jest.fn();


    // Act
    const modalLogin = mount(<ModalLogin visible={isVisible} onLoggedIn={onLoggedIn} className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} />);
    await updateWrapper(modalLogin);

    // Assert
    expect(modalLogin).toMatchSnapshot();
    expect(modalLogin.props().visible).toBe(true);
  });
});
