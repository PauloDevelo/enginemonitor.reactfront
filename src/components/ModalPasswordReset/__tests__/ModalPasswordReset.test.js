import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ignoredMessages from '../../../testHelpers/MockConsole';

import userProxy from '../../../services/UserProxy';

import ModalPasswordReset from '../ModalPasswordReset';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import HttpError from '../../../http/HttpError';

jest.mock('../../../services/UserProxy');
jest.mock('localforage');

describe('ModalPasswordReset', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    userProxy.resetPassword.mockReset();
  });

  const data = { email: 'paulodevelo@lovestreet.com', newPassword1: '', newPassword2: '' };

  it('should render the ModalPasswordReset', async () => {
    // Arrange
    const toggle = jest.fn();

    // Act
    const modalPasswordReset = mount(<ModalPasswordReset visible toggle={toggle} data={data} />);
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(modalPasswordReset).toMatchSnapshot();
    expect(modalPasswordReset.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalPasswordReset.find('Alerts');
    expect(alerts.length).toBe(0);
  });

  it('should close the modal if the user click Cancel', async () => {
    // Arrange
    const toggle = jest.fn();

    const modalPasswordReset = mount(<ModalPasswordReset visible toggle={toggle} data={data} />);
    await updateWrapper(modalPasswordReset);

    const cancelButton = modalPasswordReset.find('ModalFooter').find('Button').at(1);

    // Act
    cancelButton.simulate('click');
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(modalPasswordReset.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalPasswordReset.find('Alerts');
    expect(alerts.length).toBe(0);

    expect(toggle).toBeCalledTimes(1);
  });

  it('should call resetPassword with all the data input when the user click on reset Password, then the modal should close if the user click the Close button', async () => {
    // Arrange
    const toggle = jest.fn();
    jest.spyOn(userProxy, 'resetPassword').mockImplementation(() => Promise.resolve());

    const modalPasswordReset = mount(<ModalPasswordReset visible toggle={toggle} data={data} />);
    await updateWrapper(modalPasswordReset);

    const myForm = modalPasswordReset.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: data.email } });
    inputs.at(1).simulate('change', { target: { value: 'password1' } });
    inputs.at(2).simulate('change', { target: { value: 'password1' } });
    await updateWrapper(modalPasswordReset);

    // Act
    modalPasswordReset.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(modalPasswordReset.find('ModalFooter').find('Button').length).toBe(1);

    const alerts = modalPasswordReset.find('Alerts');
    expect(alerts.length).toBe(1);
    expect(alerts.props()).toEqual({ error: 'confirmPasswordChange', color: 'success' });
    expect(toggle).toBeCalledTimes(0);

    expect(userProxy.resetPassword).toBeCalledTimes(1);
    expect(userProxy.resetPassword.mock.calls[0][0]).toEqual(data.email);
    expect(userProxy.resetPassword.mock.calls[0][1]).toEqual('password1');

    // Act
    modalPasswordReset.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(toggle).toBeCalledTimes(1);
  });

  it('should display an error if the 2 passwords are not the same', async () => {
    // Arrange
    const toggle = jest.fn();
    jest.spyOn(userProxy, 'resetPassword').mockImplementation(() => Promise.resolve());

    const modalPasswordReset = mount(<ModalPasswordReset visible toggle={toggle} data={data} />);
    await updateWrapper(modalPasswordReset);

    const myForm = modalPasswordReset.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: data.email } });
    inputs.at(1).simulate('change', { target: { value: 'password1' } });
    inputs.at(2).simulate('change', { target: { value: 'password2' } });
    await updateWrapper(modalPasswordReset);

    // Act
    modalPasswordReset.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(modalPasswordReset.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalPasswordReset.find('Alerts');
    expect(alerts.length).toBe(1);
    expect(alerts.props()).toEqual({ errors: { password: 'passwordsHaveToBeIdentical' } });
    expect(toggle).toBeCalledTimes(0);

    expect(userProxy.resetPassword).toBeCalledTimes(0);
  });

  it('should display an error message if an error occurs during the password reset', async () => {
    // Arrange
    const toggle = jest.fn();
    jest.spyOn(userProxy, 'resetPassword').mockImplementation(() => Promise.reject(new HttpError({ error: 'network error' })));

    const modalPasswordReset = mount(<ModalPasswordReset visible toggle={toggle} data={data} />);
    await updateWrapper(modalPasswordReset);

    const myForm = modalPasswordReset.find('Memo(MyForm)');
    const inputs = myForm.find('input');
    inputs.at(0).simulate('change', { target: { value: data.email } });
    inputs.at(1).simulate('change', { target: { value: 'password1' } });
    inputs.at(2).simulate('change', { target: { value: 'password1' } });
    await updateWrapper(modalPasswordReset);

    // Act
    modalPasswordReset.find('Memo(MyForm)').simulate('submit');
    await updateWrapper(modalPasswordReset);

    // Assert
    expect(modalPasswordReset.find('ModalFooter').find('Button').length).toBe(2);

    const alerts = modalPasswordReset.find('Alerts');
    expect(alerts.length).toBe(1);
    expect(alerts.props()).toEqual({ errors: { error: 'network error' } });
    expect(toggle).toBeCalledTimes(0);

    expect(userProxy.resetPassword).toBeCalledTimes(1);
    expect(userProxy.resetPassword.mock.calls[0][0]).toEqual(data.email);
    expect(userProxy.resetPassword.mock.calls[0][1]).toEqual('password1');
  });
});
