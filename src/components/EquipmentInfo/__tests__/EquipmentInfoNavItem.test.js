
import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';

import React from 'react';

import EquipmentInfoNavItem from '../EquipmentInfoNavItem';

describe("EquipmentInfoNavItem", () => {

    const equipment = {
        _uiId: '1234',
        name: 'engine',
        brand: 'nanni',
        model: 'N3.30',
        age: 2563,
        installation: new Date('2011-02-22T16:00:00.000Z')
    }

    beforeAll(() => {
        ignoredMessages.length = 0;
    });

    beforeEach(() => {
        
    });

    afterEach(() => {

    });

    it("Should render an tab nav item not active", () => {
        // Arrange
        const setCurrentEquipment = jest.fn();

        // Act
        const equipmentInfoNavItem = mount(<EquipmentInfoNavItem equipment={equipment} active={false} setCurrentEquipment={setCurrentEquipment}/>);
        
        // Assert
        expect(setCurrentEquipment).toHaveBeenCalledTimes(0);
        expect(equipmentInfoNavItem.find('NavLink').text()).toBe(equipment.name);
        expect(equipmentInfoNavItem).toMatchSnapshot();
    });

    it("Should render an tab nav item active", () => {
        // Arrange
        const setCurrentEquipment = jest.fn();

        // Act
        const equipmentInfoNavItem = mount(<EquipmentInfoNavItem equipment={equipment} active={true} setCurrentEquipment={setCurrentEquipment}/>);
        
        // Assert
        expect(setCurrentEquipment).toHaveBeenCalledTimes(0);
        expect(equipmentInfoNavItem.find('NavLink.active').text()).toBe(equipment.name);
        expect(equipmentInfoNavItem).toMatchSnapshot();
    });

    it("Should call setCurrentEquipment after clicking on it", () => {
        // Arrange
        const setCurrentEquipment = jest.fn();
        const equipmentInfoNavItem = mount(<EquipmentInfoNavItem equipment={equipment} active={false} setCurrentEquipment={setCurrentEquipment}/>);

        // Act
        equipmentInfoNavItem.find('NavLink').simulate('click');
        
        // Assert
        expect(setCurrentEquipment).toHaveBeenCalledTimes(1);
    });
});