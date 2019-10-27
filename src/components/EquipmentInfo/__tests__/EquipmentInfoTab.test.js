
import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import React from 'react';
import { IntlProvider } from "react-intl";

import EquipmentInfoTab from '../EquipmentInfoTab';

describe("EquipmentInfoTab", () => {

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
        ignoredMessages.push("[React Intl] Could not find required `intl` object.");
        ignoredMessages.push("[React Intl] Missing message");
    });

    beforeEach(() => {
        
    });

    afterEach(() => {

    });

    it("Should render an equipment", () => {
        // Arrange
        const displayEquipment = jest.fn();

        // Act
        const equipmentInfoTab = mount(<IntlProvider locale={navigator.language}>
                                            <EquipmentInfoTab equipment={equipment} displayEquipment={displayEquipment}/>
                                        </IntlProvider>);
        
        // Assert
        expect(displayEquipment).toHaveBeenCalledTimes(0);

        expect(equipmentInfoTab.find('FormattedDate').props().value).toBe(equipment.installation);
        expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.model);
        expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.brand);
        expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.age);
        expect(equipmentInfoTab).toMatchSnapshot();
    });

    it("Should render the equipment edition modal when clicking on the edit button", () => {
        // Arrange
        const displayEquipment = jest.fn();
        const equipmentInfoTab = mount(<IntlProvider locale={navigator.language}>
                                            <EquipmentInfoTab equipment={equipment} displayEquipment={displayEquipment}/>
                                        </IntlProvider>);
        
        // Act
        equipmentInfoTab.find('TabPane').find('Button').at(0).simulate('click');

        // Assert
        expect(displayEquipment).toHaveBeenCalledTimes(1);
    });
});