import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import { v4 as uuidv4 } from 'uuid';
import ignoredMessages from '../../../testHelpers/MockConsole';

import userProxy from '../../../services/UserProxy';

import ModalSignup from '../ModalSignup';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import HttpError from '../../../http/HttpError';

jest.mock('../../../services/UserProxy');
jest.mock('localforage');
jest.mock('uuid');

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
    imageFolderSizeInByte: 0,
    imageFolderSizeLimitInByte: 0,
    imageFolder: '',
    forbidCreatingAsset: false,
    forbidUploadingImage: false,
    token: '',
    privacyPolicyAccepted: true,
  };

  it('should render the ModalSignup', async () => {
    // Arrange
    uuidv4.mockImplementation(() => 'user_01');

    const toggle = jest.fn();

    // Act
    const modalSignup = mount(<ModalSignup visible toggle={toggle} />);
    await updateWrapper(modalSignup);

    // Assert
    expect(modalSignup).toMatchSnapshot();
    expect(modalSignup.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalSignup.find('Alerts');
    expect(alerts.length).toBe(0);
  });

  it('should close the modal if the user click Cancel', async () => {
    // Arrange
    uuidv4.mockImplementation(() => 'user_01');

    const toggle = jest.fn();

    const modalSignup = mount(<ModalSignup visible toggle={toggle} />);
    await updateWrapper(modalSignup);

    const cancelButton = modalSignup.find('ModalFooter').find('Button').at(1);

    // Act
    cancelButton.simulate('click');
    await updateWrapper(modalSignup);

    // Assert
    expect(modalSignup.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalSignup.find('Alerts');
    expect(alerts.length).toBe(0);
    expect(toggle).toBeCalledTimes(1);
  });

  it('should call signup with all the data input when the user click on signup', async () => {
    // Arrange
    uuidv4.mockImplementation(() => user._uiId);

    const toggle = jest.fn();
    jest.spyOn(userProxy, 'signup').mockImplementation(() => Promise.resolve());

    const modalSignup = mount(<ModalSignup visible toggle={toggle} />);
    await updateWrapper(modalSignup);

    const myForm = modalSignup.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: user.name } });
    inputs.at(1).simulate('change', { target: { value: user.firstname } });
    inputs.at(2).simulate('change', { target: { value: user.email } });
    inputs.at(3).simulate('change', { target: { value: user.password } });
    inputs.at(4).simulate('change', { target: { checked: user.privacyPolicyAccepted } });
    await updateWrapper(modalSignup);

    // Act
    modalSignup.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalSignup);

    // Assert
    expect(modalSignup.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalSignup.find('Alerts');
    expect(alerts.length).toBe(1);
    expect(alerts.props()).toEqual({ error: 'emailSent', color: 'success' });
    expect(toggle).toBeCalledTimes(0);

    expect(userProxy.signup).toBeCalledTimes(1);
    expect(userProxy.signup.mock.calls[0][0]).toEqual(user);
  });

  it('should display an error if an error occurs during signup', async () => {
    // Arrange
    uuidv4.mockImplementation(() => user._uiId);

    const toggle = jest.fn();
    jest.spyOn(userProxy, 'signup').mockImplementation(() => Promise.reject(new HttpError({ email: 'alreadyexisting' })));

    const modalSignup = mount(<ModalSignup visible toggle={toggle} />);
    await updateWrapper(modalSignup);

    const myForm = modalSignup.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: user.name } });
    inputs.at(1).simulate('change', { target: { value: user.firstname } });
    inputs.at(2).simulate('change', { target: { value: user.email } });
    inputs.at(3).simulate('change', { target: { value: user.password } });
    inputs.at(4).simulate('change', { target: { checked: user.privacyPolicyAccepted } });
    await updateWrapper(modalSignup);

    // Act
    modalSignup.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalSignup);

    // Assert
    expect(modalSignup.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalSignup.find('Alerts');
    expect(alerts.length).toBe(1);
    expect(alerts.props()).toEqual({ errors: { email: 'alreadyexisting' } });
    expect(toggle).toBeCalledTimes(0);

    expect(userProxy.signup).toBeCalledTimes(1);
    expect(userProxy.signup.mock.calls[0][0]).toEqual(user);
  });
});
