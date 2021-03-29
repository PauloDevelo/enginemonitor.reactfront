import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';

import updateWrapper from '../../../testHelpers/EnzymeHelper';

import ModalSendInvitation from '../ModalSendInvitation';

import assetProxy from '../../../services/AssetProxy';
import { AssetModel } from '../../../types/Types';

jest.mock('../../../services/AssetProxy');
const mockedAssetProxy = assetProxy as jest.Mocked<typeof assetProxy>;

jest.mock('localforage');

describe('ModalSendInvitation', () => {
  const asset: AssetModel = {
    _uiId: '853ee383-6598-4b47-aa0e-eb2cb22d535c',
    manufactureDate: new Date(Date.UTC(2021, 1, 26, 17, 28, 14)),
    brand: 'Alu & Tech',
    modelBrand: 'Heliotrope',
    name: 'Arbutus',
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  afterEach(() => {
    mockedAssetProxy.sendOwnershipInvitation.mockReset();
  });

  it('Should render the modal as expected without error', async () => {
    // Arrange
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    // Act
    const modalSendInvitation = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalSendInvitation asset={asset} visible toggle={toggleFn} />
      </IntlProvider>,
    );

    // Assert
    expect(modalSendInvitation).toMatchSnapshot();
  });

  it('Should display an error if the address email is not correct', async () => {
    // Arrange
    mockedAssetProxy.sendOwnershipInvitation.mockImplementation(async () => Promise.resolve(''));

    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalSendInvitation = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalSendInvitation asset={asset} visible toggle={toggleFn} />
      </IntlProvider>,
    );
    await updateWrapper(modalSendInvitation);

    const myForm = modalSendInvitation.find('Memo(MyForm)');
    myForm.find('input').simulate('change', { target: { value: 'paul.torruella' } });
    await updateWrapper(modalSendInvitation);

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalSendInvitation);

    // Assert
    expect(mockedAssetProxy.sendOwnershipInvitation).toBeCalledTimes(0);
    expect(modalSendInvitation.find('input.is-invalid').length).toBe(1);
    expect(modalSendInvitation.find('div.invalid-feedback').length).toBe(1);
  });

  it('Should Call sendOwnershipInvitation when we submit and display a successful message', async () => {
    // Arrange
    mockedAssetProxy.sendOwnershipInvitation.mockImplementation(async () => Promise.resolve(''));

    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalSendInvitation = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalSendInvitation asset={asset} visible toggle={toggleFn} />
      </IntlProvider>,
    );
    await updateWrapper(modalSendInvitation);

    const myForm = modalSendInvitation.find('Memo(MyForm)');
    const input = myForm.find('input');
    input.simulate('change', { target: { value: 'paul.torruella@lovestreet.fr' } });
    await updateWrapper(modalSendInvitation);

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalSendInvitation);

    // Assert
    expect(mockedAssetProxy.sendOwnershipInvitation).toBeCalledTimes(1);

    const alertComponent = modalSendInvitation.find('Alerts');
    // eslint-disable-next-line dot-notation
    expect(alertComponent.props()['error']).toBe('invitationSent');
  });

  it('Should display an error message when sendOwnershipInvitation fails', async () => {
    // Arrange
    mockedAssetProxy.sendOwnershipInvitation.mockImplementation(async () => Promise.reject(new Error('an unexpected error occurred')));

    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalSendInvitation = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalSendInvitation asset={asset} visible toggle={toggleFn} />
      </IntlProvider>,
    );
    await updateWrapper(modalSendInvitation);

    const myForm = modalSendInvitation.find('Memo(MyForm)');
    const input = myForm.find('input');
    input.simulate('change', { target: { value: 'paul.torruella@lovestreet.fr' } });
    await updateWrapper(modalSendInvitation);

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalSendInvitation);

    // Assert
    const alertComponent = modalSendInvitation.find('Alerts');
    // eslint-disable-next-line dot-notation
    expect(alertComponent.props()['errors']).toBe('an unexpected error occurred');
  });

  it('Should close the modal when clciking on Cancel', async () => {
    // Arrange
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalSendInvitation = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalSendInvitation asset={asset} visible toggle={toggleFn} />
      </IntlProvider>,
    );

    const cancelButton = modalSendInvitation.find('Button').at(1);

    // Act
    cancelButton.simulate('click');
    await updateWrapper(modalSendInvitation);

    // Assert
    expect(toggleFn).toBeCalledTimes(1);
    expect(isVisible).toBeFalsy();
  });
});
