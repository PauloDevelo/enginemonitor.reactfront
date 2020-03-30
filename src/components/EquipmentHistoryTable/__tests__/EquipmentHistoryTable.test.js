import chai, { assert } from 'chai';

import React from 'react';
import { IntlProvider } from 'react-intl';

import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';
import imageProxy from '../../../services/ImageProxy';
import entryManager from '../../../services/EntryManager';
import entryProxy from '../../../services/EntryProxy';
import taskManager from '../../../services/TaskManager';
import equipmentManager from '../../../services/EquipmentManager';

import { AgeAcquisitionType } from '../../../types/Types';
import EquipmentHistoryTable from '../EquipmentHistoryTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EntryManager');
jest.mock('../../../services/EntryProxy');
jest.mock('../../../services/TaskManager');
jest.mock('../../../services/EquipmentManager');
jest.mock('localforage');

chai.use(require('chai-datetime'));

describe('EquipmentHistoryTable', () => {
  const equipment = {
    _uiId: 'equipment_01',
    name: 'moteur',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2750,
    installation: new Date('2019-11-07T23:39:36.288Z'),
    ageAcquisitionType: AgeAcquisitionType.manualEntry,
    ageUrl: '',
  };

  const tasks = [
    {
      _uiId: 'task_01',
      name: 'vidange',
      usagePeriodInHour: 200,
      periodInMonth: 6,
      description: 'Change the oil',
      nextDueDate: new Date('2019-11-07T23:39:36.288Z'),
      level: 0,
      usageInHourLeft: 100,
    },
    {
      _uiId: 'task_02',
      name: 'change filtre a huile',
      usagePeriodInHour: 400,
      periodInMonth: 12,
      description: 'Change le filtre a huile',
      nextDueDate: new Date('2019-12-07T23:39:36.288Z'),
      level: 0,
      usageInHourLeft: 300,
    },
  ];

  const entries = [
    {
      _uiId: 'entry_01',
      name: 'vidange',
      date: new Date('2019-11-08T00:11:18.112Z'),
      age: 1234,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_02',
      name: 'vidange inverseur',
      date: new Date('2019-11-06T00:11:18.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_02',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_03',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:18.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_02',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_04',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:19.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_02',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_05',
      name: 'vidange inverseur',
      date: new Date('2019-12-09T00:11:19.112Z'),
      age: 1225,
      remarks: 'RAS',
      taskUiId: 'task_02',
      equipmentUiId: 'equipment_01',
      ack: false,
    },
  ];

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(() => {
    entryManager.getEquipmentEntries.mockImplementation(() => entries);
    entryManager.areEntriesLoading.mockImplementation(() => false);
    entryProxy.existEntry.mockImplementation(async (equipmentId, entryId) => {
      if (entries.findIndex((e) => e._uiId === entryId) !== -1) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });

    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getTask.mockImplementation((uiId) => tasks.filter((task) => task._uiId === uiId)[0]);
    equipmentManager.getCurrentEquipment.mockImplementation(() => equipment);

    imageProxy.fetchImages.mockResolvedValue([]);
  });

  function assertTableSortedByDate(table) {
    const cells = table.find('ClickableCell');
    let previousDate;
    for (let i = 0; i < entries.length; i++) {
      for (let numColumn = 0; numColumn < 4; numColumn++) {
        const currentDate = cells.at(i * 4 + numColumn).props().data.date;

        if (previousDate !== undefined && currentDate !== previousDate) {
          assert.afterTime(previousDate, currentDate);
        }

        previousDate = currentDate;
      }
    }
  }

  afterEach(() => {
    entryManager.getEquipmentEntries.mockRestore();
    entryManager.areEntriesLoading.mockRestore();
    entryProxy.existEntry.mockRestore();
    taskManager.getTasks.mockRestore();
    taskManager.getTask.mockRestore();
    equipmentManager.getCurrentEquipment.mockRestore();

    imageProxy.fetchImages.mockRestore();
  });

  it('Should render render the loading spinner while loading the entries', async () => {
    // Arrange
    entryManager.areEntriesLoading.mockImplementation(() => true);

    // Act
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );

    // Assert
    expect(equipmentHistoryTable.find('tbody').length).toBe(0);
    expect(equipmentHistoryTable.find('Loading').length).toBe(1);
    expect(entryManager.getEquipmentEntries).toBeCalledTimes(1);

    expect(equipmentHistoryTable).toMatchSnapshot();
  });

  it('Should render all the entries for an equipment', async () => {
    // Arrange

    // Act
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);

    // Assert
    const tbodyProps = equipmentHistoryTable.find('tbody').at(0).props();
    for (let i = 0; i < entries.length; i++) {
      expect(tbodyProps.children[i].props.data).toBe(entries[i]);
    }
    expect(entryManager.getEquipmentEntries).toBeCalledTimes(1);

    expect(equipmentHistoryTable).toMatchSnapshot();
  });

  it('Should render an empty table even when the equipment is undefined', async () => {
    // Arrange
    entryManager.getEquipmentEntries.mockImplementation(() => []);

    // Act
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);

    // Assert
    const tbodyProps = equipmentHistoryTable.find('tbody').at(0).props();
    expect(tbodyProps.children.length).toBe(0);
    expect(entryManager.getEquipmentEntries).toBeCalledTimes(1);

    expect(equipmentHistoryTable).toMatchSnapshot();
  });

  it('Should open the edition entry modal when clicking on any cell', async () => {
    // Arrange
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);
    const cells = equipmentHistoryTable.find('ClickableCell');

    for (let i = 0; i < entries.length; i++) {
      for (let numColumn = 0; numColumn < 4; numColumn++) {
        // Act
        cells.at(i * 4 + numColumn).simulate('click');
        // eslint-disable-next-line no-await-in-loop
        await updateWrapper(equipmentHistoryTable);

        // Assert
        const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
        expect(editEntryModal.length).toBe(1);
        expect(editEntryModal.props().visible).toBe(true);
        expect(editEntryModal.props().equipment).toBe(equipment);
        expect(editEntryModal.props().entry).toBe(entries[i]);

        if (entries[i].taskUiId !== undefined) {
          expect(editEntryModal.props().task).not.toBeUndefined();
        } else {
          expect(editEntryModal.props().task).toBeUndefined();
        }
      }
    }
  });

  it('Should display the entries from the most recent to the oldest by default', async () => {
    // Arrange

    // Act
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);

    // Assert
    assertTableSortedByDate(equipmentHistoryTable);
  });

  it('Should add an entry in the entryManager', async () => {
    // Arrange
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);

    const addButton = equipmentHistoryTable.find('Button');
    addButton.simulate('click');
    await updateWrapper(equipmentHistoryTable);

    const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
    const { saveEntry } = editEntryModal.props();

    const newEntry = {
      _uiId: 'entry_088',
      name: 'remplacement silent bloc',
      date: new Date('2019-09-08T00:11:18.112Z'),
      age: 125894,
      remarks: 'RAS',
      taskUiId: 'task_08',
      equipmentUiId: 'equipment_01',
      ack: true,
    };
    // Act
    saveEntry(newEntry);
    await updateWrapper(equipmentHistoryTable);

    // Assert
    expect(editEntryModal.length).toBe(1);
    expect(editEntryModal.props().visible).toBe(true);
    expect(editEntryModal.props().equipment).toBe(equipment);
    expect(entryManager.onEntrySaved).toBeCalledTimes(1);
  });

  it('Should remove an entry', async () => {
    // Arrange
    const equipmentHistoryTable = mount(
      <IntlProvider locale={navigator.language}>
        <EquipmentHistoryTable />
      </IntlProvider>,
    );
    await updateWrapper(equipmentHistoryTable);

    const cells = equipmentHistoryTable.find('ClickableCell').at(5);
    cells.simulate('click');
    const entryToDelete = cells.props().data;
    await updateWrapper(equipmentHistoryTable);

    const editEntryModal = equipmentHistoryTable.find('ModalEditEntry');
    const { deleteEntry } = editEntryModal.props();

    // Act
    deleteEntry(entryToDelete);
    await updateWrapper(equipmentHistoryTable);

    // Assert
    expect(editEntryModal.length).toBe(1);
    expect(editEntryModal.props().visible).toBe(true);
    expect(editEntryModal.props().equipment).toBe(equipment);
    expect(editEntryModal.props().entry).toBe(entryToDelete);

    expect(entryManager.onEntryDeleted).toBeCalledTimes(1);
    expect(entryManager.onEntryDeleted.mock.calls[0][0]).toBe(entryToDelete);
  });
});
