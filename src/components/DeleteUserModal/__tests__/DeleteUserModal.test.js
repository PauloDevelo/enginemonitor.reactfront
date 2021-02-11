/* eslint-disable no-unused-vars */
import chai, { assert } from 'chai';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount } from 'enzyme';

import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import DeleteUserModal from '../DeleteUserModal';

import userProxy from '../../../services/UserProxy';

jest.mock('../../../services/UserProxy');

describe('DeleteUserModal', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(() => {
  });

  afterEach(() => {
    userProxy.deleteUser.mockReset();
    userProxy.logout.mockReset();
  });

  it('Should not call onUserDeleted when loaded', async () => {
    // Arrange
    let deleteUserModalVis = true;

    const toggleDeleteUserModal = () => {
      deleteUserModalVis = !deleteUserModalVis;
    };

    const onUserDeleted = jest.fn();

    // Act
    const deleteUserModal = mount(
      <IntlProvider locale={navigator.language}>
        <DeleteUserModal isOpen={deleteUserModalVis} toggle={toggleDeleteUserModal} onUserDeleted={onUserDeleted} />
      </IntlProvider>,
    );

    // Assert
    expect(onUserDeleted).toHaveBeenCalledTimes(0);
    expect(deleteUserModal).toMatchSnapshot();
  });

  it('Should have a disable button because yes or oui is not in the input.', async () => {
    // Arrange
    let deleteUserModalVis = true;

    const toggleDeleteUserModal = () => {
      deleteUserModalVis = !deleteUserModalVis;
    };

    const onUserDeleted = jest.fn();

    // Act
    const deleteUserModal = mount(
      <IntlProvider locale={navigator.language}>
        <DeleteUserModal isOpen={deleteUserModalVis} toggle={toggleDeleteUserModal} onUserDeleted={onUserDeleted} />
      </IntlProvider>,
    );

    // Assert
    const button = deleteUserModal.find('button.btn-danger').get(0);
    expect(button.props.disabled).toBe(true);
  });

  it('Should have a enable button because yes or oui is in the input.', async () => {
    // Arrange
    let deleteUserModalVis = true;

    const toggleDeleteUserModal = () => {
      deleteUserModalVis = !deleteUserModalVis;
    };

    jest.spyOn(userProxy, 'deleteUser').mockImplementation(() => Promise.resolve());
    jest.spyOn(userProxy, 'logout').mockImplementation(() => Promise.resolve());
    const onUserDeleted = jest.fn();

    const deleteUserModal = mount(
      <IntlProvider locale={navigator.language}>
        <DeleteUserModal isOpen={deleteUserModalVis} toggle={toggleDeleteUserModal} onUserDeleted={onUserDeleted} />
      </IntlProvider>,
    );

    // Act
    const inputs = deleteUserModal.find('input');
    inputs.at(0).simulate('change', { target: { value: 'yes' } });

    // Assert
    const button = deleteUserModal.find('button.btn-danger').get(0);
    expect(button.props.disabled).toBe(false);
  });

  it('Should call onUserDeleted when the user enter yes and validate', async () => {
    // Arrange
    let deleteUserModalVis = true;

    const toggleDeleteUserModal = () => {
      deleteUserModalVis = !deleteUserModalVis;
    };

    const onUserDeleted = jest.fn();

    const deleteUserModal = mount(
      <IntlProvider locale={navigator.language}>
        <DeleteUserModal isOpen={deleteUserModalVis} toggle={toggleDeleteUserModal} onUserDeleted={onUserDeleted} />
      </IntlProvider>,
    );

    const inputs = deleteUserModal.find('input');
    inputs.at(0).simulate('change', { target: { value: 'yes' } });

    const button = deleteUserModal.find('button.btn-danger');

    // Act
    button.simulate('click');
    await updateWrapper(deleteUserModal);

    // Assert
    expect(userProxy.logout).toHaveBeenCalledTimes(1);
    expect(userProxy.deleteUser).toHaveBeenCalledTimes(1);
    expect(onUserDeleted).toHaveBeenCalledTimes(1);
  });
});
