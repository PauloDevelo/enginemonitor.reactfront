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
    const onLoggedIn = jest.fn();


    // Act
    const modalLogin = mount(<ModalLogin visible onLoggedIn={onLoggedIn} className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} />);
    await updateWrapper(modalLogin);

    // Assert
    expect(modalLogin).toMatchSnapshot();
    expect(modalLogin.props().visible).toBe(true);
  });

  it('should authenticate with the value input', async () => {
    // Arrange
    let signupVisible = false;
    const toggleModalSignup = jest.fn().mockImplementation(() => {
      signupVisible = !signupVisible;
    });
    const onLoggedIn = jest.fn();

    jest.spyOn(userProxy, 'authenticate').mockImplementation(() => Promise.resolve(user));


    const modalLogin = mount(<ModalLogin visible onLoggedIn={onLoggedIn} className="modal-dialog-centered" toggleModalSignup={toggleModalSignup} />);
    await updateWrapper(modalLogin);

    // Act
    const myForm = modalLogin.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: 'paulodevelo@lovestreet.com' } });
    inputs.at(1).simulate('change', { target: { value: 'mypassword' } });
    inputs.at(2).simulate('change', { target: { type: 'checkbox', checked: true } });
    myForm.simulate('submit');
    await updateWrapper(modalLogin);

    // Assert
    expect(userProxy.authenticate).toHaveBeenCalledTimes(1);
    expect(userProxy.authenticate.mock.calls[0][0]).toEqual({ email: 'paulodevelo@lovestreet.com', password: 'mypassword', remember: true });

    expect(onLoggedIn).toBeCalledTimes(1);
    expect(onLoggedIn.mock.calls[0][0]).toEqual(user);
  });
});
