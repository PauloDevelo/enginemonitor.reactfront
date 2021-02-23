import React from 'react';
import { mount } from 'enzyme';

import { IntlProvider } from 'react-intl';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import userProxy from '../../../services/UserProxy';

import ModalLogin from '../ModalLogin';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import HttpError from '../../../http/HttpError';

jest.mock('../../../services/UserProxy');
jest.mock('localforage');

describe('ModalLogin', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('Missing message');
  });

  afterEach(() => {
    userProxy.sendVerificationEmail.mockReset();
    userProxy.authenticate.mockReset();
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

  it('should render the ModalLogin', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    // Act
    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    // Assert
    expect(modalLogin).toMatchSnapshot();
    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(0);
  });

  it('should authenticate with the value input', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.resolve(user));

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    // Act
    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });
    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    // Assert
    expect(userProxy.authenticate).toHaveBeenCalledTimes(1);
    expect(userProxy.authenticate.mock.calls[0][0]).toEqual({ email: 'paulodevelo@lovestreet.com', password: 'mypassword', remember: true });

    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(2);
    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(0);
  });

  it('should display the button to resend the verification email because the user is not verified', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.reject(new HttpError({ email: 'needVerification' })));

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    // Assert
    expect(userProxy.authenticate).toHaveBeenCalledTimes(1);
    expect(userProxy.authenticate.mock.calls[0][0]).toEqual({ email: 'paulodevelo@lovestreet.com', password: 'mypassword', remember: true });

    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(3);
    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(1);
  });

  it('should call the sendVerificationEmail because the user clicked on the button to resend the verification email', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.reject(new HttpError({ email: 'needVerification' })));
    jest.spyOn(userProxy, 'sendVerificationEmail').mockImplementation(() => Promise.resolve());

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });

    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    const resendEmail = modalLogin.find('ModalFooter').find('Button').at(1);

    // Act
    resendEmail.simulate('click');

    // Assert
    expect(userProxy.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(userProxy.sendVerificationEmail.mock.calls[0][0]).toEqual('paulodevelo@lovestreet.com');
  });

  it('should display the button to reset the password because the user set an incorrect password', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.reject(new HttpError({ password: 'invalid' })));

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    // Assert
    expect(userProxy.authenticate).toHaveBeenCalledTimes(1);
    expect(userProxy.authenticate.mock.calls[0][0]).toEqual({ email: 'paulodevelo@lovestreet.com', password: 'mypassword', remember: true });

    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(3);
    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(1);

    expect(modalLogin.find('ModalPasswordReset').length).toBe(1);
    expect(modalLogin.find('ModalPasswordReset').props().visible).toBe(false);
  });

  it('should display the Modal to reset the password because the user clicked on the button to reset the password', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.reject(new HttpError({ password: 'invalid' })));

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });

    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    const resetPasswordButton = modalLogin.find('ModalFooter').find('Button').at(1);

    // Act
    resetPasswordButton.simulate('click');

    // Assert
    expect(modalLogin.find('ModalPasswordReset').length).toBe(1);
    expect(modalLogin.find('ModalPasswordReset').props().visible).toBe(true);
  });

  it('should display an alert message when an unexpected error occurs during the authentication', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.reject(new HttpError({ error: 'Network error' })));

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = modalLogin.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    // Assert
    expect(userProxy.authenticate).toHaveBeenCalledTimes(1);
    expect(userProxy.authenticate.mock.calls[0][0]).toEqual({ email: 'paulodevelo@lovestreet.com', password: 'mypassword', remember: true });

    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(2);
    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(1);

    expect(modalLogin.find('ModalPasswordReset').length).toBe(1);
    expect(modalLogin.find('ModalPasswordReset').props().visible).toBe(false);
  });

  it('should call the toggleModalSignup when clicking on the signup button', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });

    const modalLogin = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalLogin visible className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} /></IntlProvider>);
    await updateWrapper(modalLogin);

    const signupButton = modalLogin.find('ModalFooter').find('Button').at(0);

    // Act
    signupButton.simulate('click');
    await updateWrapper(modalLogin);

    // Assert
    expect(modalLogin.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalLogin.find('Alerts');
    expect(alerts.length).toBe(0);

    expect(toggleModalSignup).toBeCalledTimes(1);
  });
});
