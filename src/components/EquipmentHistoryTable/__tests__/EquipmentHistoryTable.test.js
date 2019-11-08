import ignoredMessages from '../../../testHelpers/MockConsole';

import React from 'react';
import { IntlProvider } from "react-intl";

import { mount } from 'enzyme';

import localforage from 'localforage';
import imageProxy from '../../../services/ImageProxy';
import entryProxy from '../../../services/EntryProxy';

import {AgeAcquisitionType} from '../../../types/Types';
import EquipmentHistoryTable from '../EquipmentHistoryTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EntryProxy');
jest.mock('localforage');

describe("EquipmentHistoryTable", () => {
    const equipment = {
        _uiId: "equipment_01",
		name: "moteur",
		brand: "Nanni",
		model: "N3.30",
		age: 2750,
		installation: new Date("2019-11-07T23:39:36.288Z"),
		ageAcquisitionType: AgeAcquisitionType.manualEntry,
		ageUrl: ""
    };

    const entries = [
        {
            _uiId: "entry_01",
            name: "vidange",
            date: new Date("2019-11-08T00:11:18.112Z"),
            age: 1234,
            remarks: 'RAS',
            taskUiId: "task_01",
            equipmentUiId: "equipment_01"
        },
        {
            _uiId: "entry_02",
            name: "vidange inverseur",
            date: new Date("2019-11-06T00:11:18.112Z"),
            age: 1214,
            remarks: 'RAS',
            taskUiId: "task_02",
            equipmentUiId: "equipment_01"
        }
    ];

    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("test was not wrapped in act(...)");
        ignoredMessages.push("[React Intl] Missing message");
    });

    beforeEach(() => {
        jest.spyOn(entryProxy, "fetchAllEntries").mockImplementation(async (props) => {
            if (props.equipmentId){
                return Promise.resolve(entries);
            }
            else{
                Promise.resolve([]);
            }
        });

        imageProxy.fetchImages.mockResolvedValue([]);
    });

    afterEach(() => {
        entryProxy.fetchAllEntries.mockRestore();
        imageProxy.fetchImages.mockRestore([]);
    });

    it("Should render render the loading spinner while loading the entries", async() => {
        // Arrange
        const onEquipmentChanged = jest.fn();
    
        // Act
        const equipmentHistoryTable = mount(
            <IntlProvider locale={navigator.language}>
                <EquipmentHistoryTable 
                equipment={equipment} 
                onTaskChanged={onEquipmentChanged} 
                equipmentHistoryRefreshId={0}/>
            </IntlProvider>);
        
        // Assert
        expect(equipmentHistoryTable.find('tbody').length).toBe(0);
        expect(equipmentHistoryTable.find('Loading').length).toBe(1);
        expect(entryProxy.fetchAllEntries).toBeCalledTimes(1);
        expect(onEquipmentChanged).toBeCalledTimes(0);

        expect(equipmentHistoryTable).toMatchSnapshot();
    });

    it("Should render all the entries for an equipment", async() => {
        // Arrange
        const onEquipmentChanged = jest.fn();
    
        // Act
        const equipmentHistoryTable = mount(
            <IntlProvider locale={navigator.language}>
                <EquipmentHistoryTable 
                equipment={equipment} 
                onTaskChanged={onEquipmentChanged} 
                equipmentHistoryRefreshId={0}/>
            </IntlProvider>);
        await updateWrapper(equipmentHistoryTable);

        // Assert
        const tbodyProps = equipmentHistoryTable.find('tbody').at(0).props();
        for(let i = 0; i < entries.length; i++){
            expect(tbodyProps.children[i].props.data).toBe(entries[i]);
        }
        expect(entryProxy.fetchAllEntries).toBeCalledTimes(1);
        expect(onEquipmentChanged).toBeCalledTimes(0);
        
        expect(equipmentHistoryTable).toMatchSnapshot();
    });

    it("Should render an empty table even when the equipment is undefined", async() => {
        // Arrange
        const onEquipmentChanged = jest.fn();

        // Act
        const equipmentHistoryTable = mount(
            <IntlProvider locale={navigator.language}>
                <EquipmentHistoryTable 
                equipment={undefined} 
                onTaskChanged={onEquipmentChanged} 
                equipmentHistoryRefreshId={0}/>
            </IntlProvider>);
        await updateWrapper(equipmentHistoryTable);

        // Assert
        const tbodyProps = equipmentHistoryTable.find('tbody').at(0).props();
        expect(tbodyProps.children.length).toBe(0);
        expect(entryProxy.fetchAllEntries).toBeCalledTimes(1);
        expect(onEquipmentChanged).toBeCalledTimes(0);
        
        expect(equipmentHistoryTable).toMatchSnapshot();
    });

    it("Should rerender all the entries for an equipment when equipmentHistoryRefreshId change", async() => {
        // Arrange
        const onEquipmentChanged = jest.fn();

        const properties = {equipment, onTaskChanged:onEquipmentChanged, equipmentHistoryRefreshId: 0};
        const wrapper = mount(
            React.createElement(
                props => (
                    <IntlProvider locale={navigator.language}>
                        <EquipmentHistoryTable 
                        {...props}/>
                    </IntlProvider>
                ),
                properties)
            );
        await updateWrapper(wrapper);

        // Act
        properties.equipmentHistoryRefreshId = 1;

        wrapper.setProps(properties); 
        await updateWrapper(wrapper);
        
        // Assert
        expect(entryProxy.fetchAllEntries).toBeCalledTimes(2);
        expect(onEquipmentChanged).toBeCalledTimes(0);
    });
});