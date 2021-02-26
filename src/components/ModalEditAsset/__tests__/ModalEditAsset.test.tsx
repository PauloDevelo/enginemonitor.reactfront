import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount, ReactWrapper } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';

import updateWrapper from '../../../testHelpers/EnzymeHelper';

import ModalEditAsset from '../ModalEditAsset';

import assetProxy from '../../../services/AssetProxy';
import userProxy from '../../../services/UserProxy';
import userContext from '../../../services/UserContext';
import { AssetModel, UserModel } from '../../../types/Types';

jest.mock('../../../services/AssetProxy');
const mockedAssetProxy = assetProxy as jest.Mocked<typeof assetProxy>;

jest.mock('../../../services/UserContext');
const mockedUserContext = userContext as jest.Mocked<typeof userContext>;

jest.mock('../../../services/UserProxy');
const mockedUserProxy = userProxy as jest.Mocked<typeof userProxy>;

jest.mock('localforage');

describe('ModalEditAsset', () => {
  const currentUser: UserModel = {
    _uiId: 'an id',
    name: 'Torruella',
    email: 'paul.torruella@lovestreet.org',
    password: 'qdfv',
    firstname: 'paul',
    imageFolderSizeInByte: 123,
    imageFolderSizeLimitInByte: 1234,
    imageFolder: 'iamge folder ???',
    forbidUploadingImage: true,
    forbidCreatingAsset: true,
    token: 'a token',
    privacyPolicyAccepted: true,
  };

  const asset: AssetModel = {
    _uiId: '853ee383-6598-4b47-aa0e-eb2cb22d535c',
    manufactureDate: new Date(2021, 1, 26, 17, 28, 14),
    brand: 'Alu & Tech',
    modelBrand: 'Heliotrope',
    name: 'Arbutus',
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  afterEach(() => {
    mockedAssetProxy.existAsset.mockReset();
    mockedUserContext.getCurrentUser.mockReset();
    mockedUserProxy.getCredentials.mockReset();
  });

  const expectCreationButton = (wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>, isThereCreationButton: boolean) => {
    const creationButtons = wrapper.find('button.btn-success');
    expect(creationButtons.length).toBe(isThereCreationButton ? 1 : 0);

    if (isThereCreationButton) {
      const creationButton = creationButtons.at(0);
      expect(creationButton.getDOMNode().getAttribute('type')).toEqual('submit');
      expect(creationButton.getDOMNode().innerHTML).toEqual('Create');
    }
  };

  const expectSaveButton = (wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>, isThereSaveButton: boolean) => {
    const saveButtons = wrapper.find('button.btn-success');
    expect(saveButtons.length).toBe(isThereSaveButton ? 1 : 0);

    if (isThereSaveButton) {
      const saveButton = saveButtons.at(0);
      expect(saveButton.getDOMNode().getAttribute('type')).toEqual('submit');
      expect(saveButton.getDOMNode().innerHTML).toEqual('Save');
    }
  };

  const expectInvitButton = (wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>, isThereInvitButton: boolean) => {
    const invitButtons = wrapper.find('button.btn-danger');
    expect(invitButtons.length).toBe(isThereInvitButton ? 1 : 0);

    if (isThereInvitButton) {
      const invitButton = invitButtons.at(0);
      expect(invitButton.getDOMNode().getAttribute('type')).toEqual('button');
      expect(invitButton.getDOMNode().innerHTML).toEqual('Change ownership');
    }
  };

  const createButtonVisibilityDataRows: Array<[boolean, boolean]> = [
    [true, false],
    [false, true],
  ];
  describe.each(createButtonVisibilityDataRows)('Creation button visibility', (forbidCreatingAsset: boolean, isThereCreationButton: boolean) => {
    test(`When the user is ${forbidCreatingAsset ? '' : 'not'} forbidden to create an asset, it should ${isThereCreationButton ? '' : 'not'} contain the creation button`, async () => {
      // Arrange
      let isVisible = true;
      const toggleFn = jest.fn().mockImplementation(() => {
        isVisible = !isVisible;
      });

      currentUser.forbidCreatingAsset = forbidCreatingAsset;

      mockedAssetProxy.existAsset.mockImplementation(async () => Promise.resolve(false));
      mockedUserContext.getCurrentUser.mockImplementation(() => currentUser);

      // Act
      const modalEditAsset = mount(
        <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
          <ModalEditAsset asset={asset} visible hideDeleteButton toggle={toggleFn} />
        </IntlProvider>,
      );
      await updateWrapper(modalEditAsset);

      // Assert
      expect(modalEditAsset).toMatchSnapshot();
      expectCreationButton(modalEditAsset, isThereCreationButton);
      expectInvitButton(modalEditAsset, false);
    });
  });

  const saveAndInvitButtonVisibilityDataRows: Array<[boolean, boolean, boolean]> = [
    [true, false, false],
    [false, true, true],
  ];
  describe.each(saveAndInvitButtonVisibilityDataRows)('Save and Invite button visibilities', (isReadOnly: boolean, isSaveButton: boolean, isInvitButton: boolean) => {
    test(`when the user is ${isReadOnly ? 'not' : ''} allowed to change the asset, there should ${isSaveButton ? '' : 'not'} be a save button and there should ${isInvitButton ? '' : 'not'} be a 'Send invitation' button`, async () => {
      // Arrange
      let isVisible = true;
      const toggleFn = jest.fn().mockImplementation(() => {
        isVisible = !isVisible;
      });

      currentUser.forbidCreatingAsset = false;

      mockedAssetProxy.existAsset.mockImplementation(async () => Promise.resolve(true));
      mockedUserContext.getCurrentUser.mockImplementation(() => currentUser);
      mockedUserProxy.getCredentials.mockImplementation(async () => Promise.resolve({
        readonly: isReadOnly,
      }));

      // Act
      const modalEditAsset = mount(
        <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
          <ModalEditAsset asset={asset} visible hideDeleteButton toggle={toggleFn} />
        </IntlProvider>,
      );
      await updateWrapper(modalEditAsset);

      // Assert
      expect(modalEditAsset).toMatchSnapshot();
      expectSaveButton(modalEditAsset, isSaveButton);
      expectInvitButton(modalEditAsset, isInvitButton);
    });
  });

  it('Should save the asset using the asset proxy when clicking on Save', async () => {
    // Arrange
    mockedAssetProxy.existAsset.mockImplementation(async () => Promise.resolve(true));
    mockedAssetProxy.createOrSaveAsset.mockImplementation(async (assetToSave) => Promise.resolve(assetToSave));

    mockedUserContext.getCurrentUser.mockImplementation(() => currentUser);
    mockedUserProxy.getCredentials.mockImplementation(async () => Promise.resolve({
      readonly: false,
    }));

    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditAsset = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <ModalEditAsset asset={asset} visible hideDeleteButton toggle={toggleFn} />
      </IntlProvider>,
    );
    await updateWrapper(modalEditAsset);

    const myForm = modalEditAsset.find('Memo(MyForm)');

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalEditAsset);

    // Assert
    expect(mockedAssetProxy.createOrSaveAsset).toBeCalledTimes(1);
    expect(toggleFn).toBeCalledTimes(1);
  });
});
