import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';
import localforage from 'localforage';


import React from 'react';
import { IntlProvider } from "react-intl";

import EquipmentsInfo from '../EquipmentsInfo';

import imageProxy from '../../../services/ImageProxy';
import equipmentProxy from '../../../services/EquipmentProxy';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('localforage');

describe("EquipmentsInfo", () => {

    const equipments = [
        {
            _uiId: '1',
            name: 'engine',
            brand: 'nanni',
            model: 'N3.30',
            age: 2563,
            installation: new Date('2011-08-15T13:00:00.000Z')
        },
        {
            _uiId: '2',
            name: 'boat',
            brand: 'Aluminium et Techniques',
            model: 'heliotrope',
            age: 2563000,
            installation: new Date('1979-07-22T17:00:00.000Z')
        },
        {
            _uiId: '3',
            name: 'watermaker',
            brand: 'Katadyn',
            model: 'PowerSurvivor 40E',
            age: 120,
            installation: new Date('2018-02-01T16:00:00.000Z')
        }
    ]

    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("test was not wrapped in act(...)");
        ignoredMessages.push("[React Intl] Could not find required `intl` object.");
        ignoredMessages.push("[React Intl] Missing message");
    });

    beforeEach(() => {
        imageProxy.fetchImages.mockResolvedValue([]);

        jest.spyOn(equipmentProxy, "fetchEquipments").mockImplementation(async (props) => {
            return Promise.resolve(equipments);
        });
    });

    afterEach(() => {
        imageProxy.fetchImages.mockRestore();
        equipmentProxy.fetchEquipments.mockRestore();
    });

    it("Should render a equipment tabs with hte first equipment selected", async() => {
        // Arrange
        const changeCurrentEquipment = jest.fn();

        // Act
        const equipmentsInfo = mount(<IntlProvider locale={navigator.language}>
                                            <EquipmentsInfo userId={"paul"} changeCurrentEquipment={changeCurrentEquipment} extraClassNames=""/>
                                        </IntlProvider>);
        await updateWrapper(equipmentsInfo);
        
        // Assert
        expect(changeCurrentEquipment).toHaveBeenCalledTimes(2);
        expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);

        expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length);
        expect(equipmentsInfo.find("TabContent").props().activeTab).toBe(equipments[0]._uiId);

        const navItems = equipmentsInfo.find("Memo(EquipmentInfoNavItem)");
        expect(navItems.length).toBe(equipments.length);
        expect(navItems.at(0).props().active).toBe(true);

        expect(equipmentsInfo).toMatchSnapshot();
    });

    it("Should render a equipment tabs with the second equipment selected because we clicked on it", async() => {
        // Arrange
        const changeCurrentEquipment = jest.fn();

        const equipmentsInfo = mount(<IntlProvider locale={navigator.language}>
                                            <EquipmentsInfo userId={"paul"} changeCurrentEquipment={changeCurrentEquipment} extraClassNames=""/>
                                        </IntlProvider>);
        await updateWrapper(equipmentsInfo);

        // Act
        let navItems = equipmentsInfo.find("Memo(EquipmentInfoNavItem)");
        navItems.at(1).find('NavLink').simulate('click');
        await updateWrapper(equipmentsInfo);
        
        // Assert
        expect(changeCurrentEquipment).toHaveBeenCalledTimes(3);
        expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(1);

        expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length);
        expect(equipmentsInfo.find("TabContent").props().activeTab).toBe(equipments[1]._uiId);

        navItems = equipmentsInfo.find("Memo(EquipmentInfoNavItem)");
        expect(navItems.length).toBe(equipments.length);
        expect(navItems.at(0).props().active).toBe(false);
        expect(navItems.at(1).props().active).toBe(true);
        expect(navItems.at(2).props().active).toBe(false);
    });

    it("Should render a new equipment tab because we created a new equipment", async() => {
        jest.setTimeout(30000);

        // Arrange
        const changeCurrentEquipment = jest.fn();

        
        const equipmentsInfo = mount(<IntlProvider locale={navigator.language}>
                                            <EquipmentsInfo userId={"paul"} changeCurrentEquipment={changeCurrentEquipment} extraClassNames=""/>
                                        </IntlProvider>);
        await updateWrapper(equipmentsInfo);

        let addEquipmentButton = equipmentsInfo.find("Button").at(0);
        addEquipmentButton.simulate('click');
        await updateWrapper(equipmentsInfo);

        const editEquipmentModal = equipmentsInfo.find('ModalEquipmentInfo');
        const onEquipmentInfoSaved = editEquipmentModal.props().onEquipmentInfoSaved;

        const newEquipment = {
            _uiId: '4',
            name: 'outboard engine',
            brand: 'Parsun',
            model: '5.8',
            age: 200,
            installation: new Date('2018-04-15T10:00:00.000Z')
        }

        // Act
        onEquipmentInfoSaved(newEquipment);
        await updateWrapper(equipmentsInfo);
        
        // Assert
        expect(changeCurrentEquipment).toHaveBeenCalledTimes(3);
        expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(2);
        expect(equipmentProxy.fetchEquipments).toHaveBeenNthCalledWith(2, true);

        expect(equipmentsInfo.find('Memo(EquipmentInfoTab)').length).toBe(equipments.length + 1);
        expect(equipmentsInfo.find("TabContent").props().activeTab).toBe(newEquipment._uiId);

        const navItems = equipmentsInfo.find("Memo(EquipmentInfoNavItem)");
        expect(navItems.length).toBe(equipments.length + 1);
        expect(navItems.at(0).props().active).toBe(false);
        expect(navItems.at(1).props().active).toBe(false);
        expect(navItems.at(2).props().active).toBe(false);
        expect(navItems.at(3).props().active).toBe(true);
    });
});