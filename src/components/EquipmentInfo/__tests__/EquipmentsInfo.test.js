import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import React from 'react';
import { IntlProvider } from 'react-intl';
import ignoredMessages from '../../../testHelpers/MockConsole';

import EquipmentsInfo from '../EquipmentsInfo';

import storageService from '../../../services/StorageService';
import onlineManager from '../../../services/OnlineManager';
import imageProxy from '../../../services/ImageProxy';
import equipmentProxy from '../../../services/EquipmentProxy';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import assetManager from '../../../services/AssetManager';

jest.mock('../../../services/OnlineManager');
jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EquipmentProxy');
jest.mock('../../../services/StorageService');
jest.mock('localforage');

describe('EquipmentsInfo', () => {
  const equipments = [
    {
      _uiId: '1',
      name: 'engine',
      brand: 'nanni',
      model: 'N3.30',
      age: 2563,
      installation: new Date('2011-08-15T13:00:00.000Z'),
    },
    {
      _uiId: '2',
      name: 'boat',
      brand: 'Aluminium et Techniques',
      model: 'heliotrope',
      age: 2563000,
      installation: new Date('1979-07-22T17:00:00.000Z'),
    },
    {
      _uiId: '3',
      name: 'watermaker',
      brand: 'Katadyn',
      model: 'PowerSurvivor 40E',
      age: 120,
      installation: new Date('2018-02-01T16:00:00.000Z'),
    },
  ];

  beforeAll(async () => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(async () => {
    imageProxy.fetchImages.mockResolvedValue([]);
    equipmentProxy.fetchEquipments.mockImplementation(async () => Promise.resolve(equipments));
    equipmentProxy.existEquipment.mockImplementation(async (equipmentUiId) => Promise.resolve(equipments.findIndex((eq) => eq._uiId === equipmentUiId) !== -1));

    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));

    storageService.isUserStorageOpened.mockImplementation(() => true);
    storageService.setItem.mockImplementation(async (key, data) => data);
    storageService.getItem.mockImplementation(async () => undefined);
    storageService.getArray.mockImplementation(async () => []);

    await assetManager.setCurrentAsset({
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    });
  });

  afterEach(() => {
    imageProxy.fetchImages.mockRestore();
    equipmentProxy.fetchEquipments.mockRestore();
    equipmentProxy.existEquipment.mockRestore();

    onlineManager.isOnline.mockRestore();

    storageService.isUserStorageOpened.mockRestore();
    storageService.setItem.mockRestore();
    storageService.getItem.mockRestore();
    storageService.getArray.mockRestore();
  });

  it('Should render a equipment tabs with the first equipment selected', async () => {
    // Arrange

    // Act
    const equipmentsInfo = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentsInfo className="" />
      </IntlProvider>,
    );
    await updateWrapper(equipmentsInfo);

    // Assert
    expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);

    expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length);
    expect(equipmentsInfo.find('TabContent').props().activeTab).toBe(equipments[0]._uiId);

    const navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    expect(navItems.length).toBe(equipments.length);
    expect(navItems.at(0).props().active).toBe(true);

    expect(equipmentsInfo).toMatchSnapshot();
  });

  it('Should render a equipment tabs with the second equipment selected because we clicked on it', async () => {
    // Arrange
    const equipmentsInfo = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentsInfo className="" />
      </IntlProvider>,
    );
    await updateWrapper(equipmentsInfo);

    // Act
    let navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    navItems.at(1).find('NavLink').simulate('click');
    await updateWrapper(equipmentsInfo);

    // Assert
    expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);

    expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length);
    expect(equipmentsInfo.find('TabContent').props().activeTab).toBe(equipments[1]._uiId);

    navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    expect(navItems.length).toBe(equipments.length);
    expect(navItems.at(0).props().active).toBe(false);
    expect(navItems.at(1).props().active).toBe(true);
    expect(navItems.at(2).props().active).toBe(false);
  });

  it('Should render a new equipment tab because we created a new equipment', async () => {
    // Arrange
    const nbEquipment = equipments.length;
    const equipmentsInfo = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentsInfo className="" />
      </IntlProvider>,
    );
    await updateWrapper(equipmentsInfo);

    const addEquipmentButton = equipmentsInfo.find('Button').at(0);
    addEquipmentButton.simulate('click');
    await updateWrapper(equipmentsInfo);

    const editEquipmentModal = equipmentsInfo.find('ModalEquipmentInfo');
    const { onEquipmentInfoSaved } = editEquipmentModal.props();

    const newEquipment = {
      _uiId: '4',
      name: 'outboard engine',
      brand: 'Parsun',
      model: '5.8',
      age: 200,
      installation: new Date('2018-04-15T10:00:00.000Z'),
    };

    // Act
    onEquipmentInfoSaved(newEquipment);
    await updateWrapper(equipmentsInfo);

    // Assert
    expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);
    // expect(equipmentProxy.fetchEquipments).toHaveBeenNthCalledWith(2, true);

    expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(nbEquipment + 1);
    expect(equipmentsInfo.find('TabContent').props().activeTab).toBe(newEquipment._uiId);

    const navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    expect(navItems.length).toBe(nbEquipment + 1);
    expect(navItems.at(0).props().active).toBe(false);
    expect(navItems.at(1).props().active).toBe(false);
    expect(navItems.at(2).props().active).toBe(false);
    expect(navItems.at(3).props().active).toBe(true);
  }, 10000);

  it('Should render only 2 equipment tabs because we removed an equipment', async () => {
    // Arrange
    const equipmentsInfo = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentsInfo className="" />
      </IntlProvider>,
    );
    await updateWrapper(equipmentsInfo);

    let navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    navItems.at(1).find('NavLink').simulate('click');
    await updateWrapper(equipmentsInfo);

    const editEquipmentButton = equipmentsInfo.find('Memo(EquipmentInfoTab)').at(1).find('Button').at(0);
    editEquipmentButton.simulate('click');
    await updateWrapper(equipmentsInfo);

    const editEquipmentModal = equipmentsInfo.find('ModalEquipmentInfo');
    const { onEquipmentDeleted } = editEquipmentModal.props();

    // Act
    onEquipmentDeleted(equipments[1]);
    await updateWrapper(equipmentsInfo);

    // Assert
    expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);
    // expect(equipmentProxy.fetchEquipments).toHaveBeenNthCalledWith(2, true);

    expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length - 1);
    expect(equipmentsInfo.find('TabContent').props().activeTab).toBe(equipments[0]._uiId);

    navItems = equipmentsInfo.find('Memo(EquipmentInfoNavItem)');
    expect(navItems.length).toBe(equipments.length - 1);
    expect(navItems.at(0).props().active).toBe(true);
    expect(navItems.at(1).props().active).toBe(false);
  });
});
