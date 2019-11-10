import ignoredMessages from '../../../testHelpers/MockConsole';
import chai, {assert} from 'chai';

import React from 'react';
import { IntlProvider } from "react-intl";

import { mount } from 'enzyme';

import localforage from 'localforage';
import imageProxy from '../../../services/ImageProxy';
import entryProxy from '../../../services/EntryProxy';

import {AgeAcquisitionType} from '../../../types/Types';
import HistoryTaskTable from '../HistoryTaskTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EntryProxy');
jest.mock('localforage');

chai.use(require('chai-datetime'));

describe("HistoryTaskTable", () => {
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

    const task = {
        _uiId: "task_01",
		name: 'vidange',
		usagePeriodInHour: 200,
		periodInMonth: 6,
        description: 'Change the oil',
        nextDueDate: new Date("2019-11-07T23:39:36.288Z"),
        level: 0,
        usageInHourLeft: 100,
	}

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
            taskUiId: "task_01",
            equipmentUiId: "equipment_01"
        },
        {
            _uiId: "entry_03",
            name: "vidange inverseur",
            date: new Date("2019-11-09T00:11:18.112Z"),
            age: 1214,
            remarks: 'RAS',
            taskUiId: "task_01",
            equipmentUiId: "equipment_01"
        },
        {
            _uiId: "entry_04",
            name: "vidange inverseur",
            date: new Date("2019-11-09T00:11:19.112Z"),
            age: 1214,
            remarks: 'RAS',
            taskUiId: "task_01",
            equipmentUiId: "equipment_01"
        }
    ];

    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("test was not wrapped in act(...)");
        ignoredMessages.push("[React Intl] Missing message");
    });

    beforeEach(() => {
        jest.spyOn(entryProxy, "fetchEntries").mockImplementation(async (props) => {
            if (props.taskId === "task_01"){
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
        entryProxy.fetchEntries.mockRestore();
        entryProxy.existEntry.mockRestore();
        imageProxy.fetchImages.mockRestore();
    });

    it("Should render render the loading spinner while loading the entries", async() => {
        // Arrange
        const onHistoryChanged = jest.fn();
    
        // Act
        const historyTaskTable = mount(
            <IntlProvider locale={navigator.language}>
                <HistoryTaskTable 
                equipment={equipment} 
                task={task}
                onHistoryChanged={onHistoryChanged} 
                taskHistoryRefreshId={0}/>
            </IntlProvider>);
        
        // Assert
        expect(historyTaskTable.find('tbody').length).toBe(0);
        expect(historyTaskTable.find('Loading').length).toBe(1);
        expect(entryProxy.fetchEntries).toBeCalledTimes(1);
        expect(onHistoryChanged).toBeCalledTimes(0);

        expect(historyTaskTable).toMatchSnapshot();
    });

    it("Should render all the entries for a task", async() => {
        // Arrange
        const onHistoryChanged = jest.fn();
    
        // Act
        const historyTaskTable = mount(
            <IntlProvider locale={navigator.language}>
                <HistoryTaskTable 
                equipment={equipment} 
                task={task}
                onHistoryChanged={onHistoryChanged} 
                taskHistoryRefreshId={0}/>
            </IntlProvider>);
        await updateWrapper(historyTaskTable);

        // Assert
        const tbodyProps = historyTaskTable.find('tbody').at(0).props();
        for(let i = 0; i < entries.length; i++){
            expect(tbodyProps.children[i].props.data).toBe(entries[i]);
        }
        expect(entryProxy.fetchEntries).toBeCalledTimes(1);
        expect(onHistoryChanged).toBeCalledTimes(0);
        
        expect(onHistoryChanged).toMatchSnapshot();
    });

    it("Should render an empty table even when the task is undefined", async() => {
        // Arrange
        const onHistoryChanged = jest.fn();

        // Act
        const historyTaskTable = mount(
            <IntlProvider locale={navigator.language}>
                <HistoryTaskTable 
                equipment={equipment} 
                task={undefined}
                onHistoryChanged={onHistoryChanged} 
                taskHistoryRefreshId={0}/>
            </IntlProvider>);
        await updateWrapper(historyTaskTable);

        // Assert
        const tbodyProps = historyTaskTable.find('tbody').at(0).props();
        expect(tbodyProps.children.length).toBe(0);
        expect(entryProxy.fetchEntries).toBeCalledTimes(1);
        expect(onHistoryChanged).toBeCalledTimes(0);
        
        expect(onHistoryChanged).toMatchSnapshot();
    });

    it("Should rerender all the entries for a task when equipmentHistoryRefreshId change", async() => {
        // Arrange
        const onHistoryChanged = jest.fn();

        const properties = {equipment, task, onHistoryChanged, taskHistoryRefreshId: 0};
        const wrapper = mount(
            React.createElement(
                props => (
                    <IntlProvider locale={navigator.language}>
                        <HistoryTaskTable 
                        {...props}/>
                    </IntlProvider>
                ),
                properties)
            );
        await updateWrapper(wrapper);

        // Act
        properties.taskHistoryRefreshId = 1;

        wrapper.setProps(properties); 
        await updateWrapper(wrapper);
        
        // Assert
        expect(entryProxy.fetchEntries).toBeCalledTimes(2);
        expect(onHistoryChanged).toBeCalledTimes(0);
    });

    // it("Should open the edition entry modal when clicking on any cell", async() => {
    //     // Arrange
    //     const onEquipmentChanged = jest.fn();

    //     const equipmentHistoryTable = mount(
    //         <IntlProvider locale={navigator.language}>
    //             <EquipmentHistoryTable 
    //             equipment={equipment} 
    //             onTaskChanged={onEquipmentChanged} 
    //             equipmentHistoryRefreshId={0}/>
    //         </IntlProvider>);
    //     await updateWrapper(equipmentHistoryTable);
    //     const cells = equipmentHistoryTable.find('ClickableCell');

    //     for(let i = 0; i < entries.length; i++){
    //         for(let numColumn = 0; numColumn < 4; numColumn++){
    //             // Act
    //             cells.at(i * 4 + numColumn).simulate('click');
    //             await updateWrapper(equipmentHistoryTable);

    //             // Assert
    //             const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
    //             expect(editEntryModal.length).toBe(1);
    //             expect(editEntryModal.props().visible).toBe(true);
    //             expect(editEntryModal.props().equipment).toBe(equipment);
    //             expect(editEntryModal.props().entry).toBe(entries[i]);
    //         }
    //     }
    // });

    // it("Should display the entries from the most recent to the oldest by default", async() => {
    //     // Arrange
    //     const onEquipmentChanged = jest.fn();

    //     // Act
    //     const equipmentHistoryTable = mount(
    //         <IntlProvider locale={navigator.language}>
    //             <EquipmentHistoryTable 
    //             equipment={equipment} 
    //             onTaskChanged={onEquipmentChanged} 
    //             equipmentHistoryRefreshId={0}/>
    //         </IntlProvider>);
    //     await updateWrapper(equipmentHistoryTable);

    //     // Assert
    //     assertTableSortedByDate(equipmentHistoryTable);
    // });

    // it("Should add an entry and it should remain sorted by date", async() => {
    //     // Arrange
    //     const onEquipmentChanged = jest.fn();
        
    //     const equipmentHistoryTable = mount(
    //         <IntlProvider locale={navigator.language}>
    //             <EquipmentHistoryTable 
    //             equipment={equipment} 
    //             onTaskChanged={onEquipmentChanged} 
    //             equipmentHistoryRefreshId={0}/>
    //         </IntlProvider>);
    //     await updateWrapper(equipmentHistoryTable);

    //     const addButton = equipmentHistoryTable.find('Button');
    //     addButton.simulate('click');
    //     await updateWrapper(equipmentHistoryTable);

    //     const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
    //     const saveEntry = editEntryModal.props().saveEntry;

    //     const newEntry = {
    //         _uiId: "entry_088",
    //         name: "remplacement silent bloc",
    //         date: new Date("2019-09-08T00:11:18.112Z"),
    //         age: 125894,
    //         remarks: 'RAS',
    //         taskUiId: "task_08",
    //         equipmentUiId: "equipment_01"
    //     }
    //     // Act
    //     saveEntry(newEntry);
    //     await updateWrapper(equipmentHistoryTable);

    //     // Assert
    //     expect(editEntryModal.length).toBe(1);
    //     expect(editEntryModal.props().visible).toBe(true);
    //     expect(editEntryModal.props().equipment).toBe(equipment);

    //     expect(equipmentHistoryTable.find('ClickableCell').length).toBe((entries.length + 1) * 4);
    //     const newCells = equipmentHistoryTable.find('ClickableCell').findWhere(n => n.props().data === newEntry);
    //     expect(newCells.length).toBe(4);

    //     assertTableSortedByDate(equipmentHistoryTable);
    //     expect(onEquipmentChanged).toBeCalledTimes(1);
    // });

    // it("Should remove an entry", async() => {
    //     // Arrange
    //     const onTaskChanged = jest.fn();
        
    //     const equipmentHistoryTable = mount(
    //         <IntlProvider locale={navigator.language}>
    //             <EquipmentHistoryTable 
    //             equipment={equipment} 
    //             onTaskChanged={onTaskChanged} 
    //             equipmentHistoryRefreshId={0}/>
    //         </IntlProvider>);
    //     await updateWrapper(equipmentHistoryTable);

    //     const cells = equipmentHistoryTable.find('ClickableCell').at(5);
    //     cells.simulate('click');
    //     const entryToDelete = cells.props().data;
    //     await updateWrapper(equipmentHistoryTable);

    //     const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
    //     const deleteEntry = editEntryModal.props().deleteEntry;

    //     // Act
    //     deleteEntry(entryToDelete);
    //     await updateWrapper(equipmentHistoryTable);

    //     // Assert
    //     expect(editEntryModal.length).toBe(1);
    //     expect(editEntryModal.props().visible).toBe(true);
    //     expect(editEntryModal.props().equipment).toBe(equipment);
    //     expect(editEntryModal.props().entry).toBe(entryToDelete);

    //     expect(equipmentHistoryTable.find('ClickableCell').length).toBe((entries.length - 1) * 4);
    //     const newCells = equipmentHistoryTable.find('ClickableCell').findWhere(n => n.props().data === entryToDelete);
    //     expect(newCells.length).toBe(0);

    //     expect(onTaskChanged).toBeCalledTimes(1);
    // });

    // function assertTableSortedByDate(table){
    //     const cells = table.find('ClickableCell');
    //     let previousDate = undefined;
    //     for(let i = 0; i < entries.length; i++){
    //         for(let numColumn = 0; numColumn < 4; numColumn++){
    //             const currentDate = cells.at(i * 4 + numColumn).props().data.date;
                
    //             if(previousDate !== undefined && currentDate !== previousDate){
    //                 assert.afterTime(previousDate, currentDate);
    //             }

    //             previousDate = currentDate;
    //         }
    //     }
    // }
});