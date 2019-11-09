import ignoredMessages from '../../../testHelpers/MockConsole';
import chai, {assert} from 'chai';


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

chai.use(require('chai-datetime'));

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
        },
        {
            _uiId: "entry_03",
            name: "vidange inverseur",
            date: new Date("2019-11-09T00:11:18.112Z"),
            age: 1214,
            remarks: 'RAS',
            taskUiId: "task_02",
            equipmentUiId: "equipment_01"
        },
        {
            _uiId: "entry_04",
            name: "vidange inverseur",
            date: new Date("2019-11-09T00:11:19.112Z"),
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
            Promise.resolve([]);
        });

        jest.spyOn(entryProxy, "existEntry").mockImplementation(async (equipmentId, entryId) => {
            if (entries.findIndex(e => e._uiId === entryId) !== -1){
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        });


        imageProxy.fetchImages.mockResolvedValue([]);
    });

    afterEach(() => {
        entryProxy.fetchAllEntries.mockRestore();
        entryProxy.existEntry.mockRestore();
        imageProxy.fetchImages.mockRestore();
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

    it("Should open the edition entry modal when clicking on any cell", async() => {
        // Arrange
        const onEquipmentChanged = jest.fn();

        const equipmentHistoryTable = mount(
            <IntlProvider locale={navigator.language}>
                <EquipmentHistoryTable 
                equipment={equipment} 
                onTaskChanged={onEquipmentChanged} 
                equipmentHistoryRefreshId={0}/>
            </IntlProvider>);
        await updateWrapper(equipmentHistoryTable);
        const cells = equipmentHistoryTable.find('ClickableCell');

        for(let i = 0; i < entries.length; i++){
            for(let numColumn = 0; numColumn < 4; numColumn++){
                // Act
                cells.at(i * 4 + numColumn).simulate('click');
                await updateWrapper(equipmentHistoryTable);

                // Assert
                const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
                expect(editEntryModal.length).toBe(1);
                expect(editEntryModal.props().visible).toBe(true);
                expect(editEntryModal.props().equipment).toBe(equipment);
                expect(editEntryModal.props().entry).toBe(entries[i]);
            }
        }
    });

    it("Should display the entries from the most recent to the oldest by default", async() => {
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
        const cells = equipmentHistoryTable.find('ClickableCell');
        let previousDate = undefined;
        for(let i = 0; i < entries.length; i++){
            for(let numColumn = 0; numColumn < 4; numColumn++){
                const currentDate = cells.at(i * 4 + numColumn).props().data.date;
                
                if(previousDate !== undefined && currentDate !== previousDate){
                    assert.afterTime(previousDate, currentDate);
                }

                previousDate = currentDate;
            }
        }
    });
});