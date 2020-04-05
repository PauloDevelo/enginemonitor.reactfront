import chai, { assert } from 'chai';

import React from 'react';
import { IntlProvider } from 'react-intl';

import _ from 'lodash';

import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';
import imageProxy from '../../../services/ImageProxy';
import equipmentManager from '../../../services/EquipmentManager';
import taskManager from '../../../services/TaskManager';
import entryManager from '../../../services/EntryManager';
import entryProxy from '../../../services/EntryProxy';

import { AgeAcquisitionType } from '../../../types/Types';
import HistoryTaskTable from '../HistoryTaskTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EquipmentManager');
jest.mock('../../../services/TaskManager');
jest.mock('../../../services/EntryManager');
jest.mock('../../../services/EntryProxy');
jest.mock('localforage');

chai.use(require('chai-datetime'));

describe('HistoryTaskTable', () => {
  const nbColumn = 4;

  const equipment = {
    _uiId: 'equipment_01',
    name: 'moteur',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2750,
    installation: new Date('2018-11-07T23:39:36.288Z'),
    ageAcquisitionType: AgeAcquisitionType.manualEntry,
    ageUrl: '',
  };

  const task = {
    _uiId: 'task_01',
    name: 'vidange',
    usagePeriodInHour: 200,
    periodInMonth: 6,
    description: 'Change the oil',
    nextDueDate: new Date('2019-11-07T23:39:36.288Z'),
    level: 0,
    usageInHourLeft: 100,
  };

  const entries = [
    {
      _uiId: 'entry_01',
      name: 'vidange',
      date: new Date('2019-11-08T00:11:18.112Z'),
      age: 1204,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_02',
      name: 'vidange inverseur',
      date: new Date('2019-11-06T00:11:18.112Z'),
      age: 1194,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
    {
      _uiId: 'entry_03',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:18.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
      ack: false,
    },
    {
      _uiId: 'entry_04',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:19.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
      ack: true,
    },
  ];

  const entriesSortedByDate = _.orderBy(entries, (entry) => entry.date, 'asc');

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(() => {
    equipmentManager.getCurrentEquipment.mockImplementation(() => equipment);
    taskManager.getCurrentTask.mockImplementation(() => task);
    taskManager.isCurrentTaskChanging.mockImplementation(() => false);
    entryManager.getTaskEntries.mockImplementation(() => entriesSortedByDate);
    entryManager.areEntriesLoading.mockImplementation(() => false);

    entryProxy.existEntry.mockImplementation(async (equipmentId, entryId) => {
      if (entries.findIndex((e) => e._uiId === entryId) !== -1) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });

    imageProxy.fetchImages.mockResolvedValue([]);
  });

  afterEach(() => {
    equipmentManager.getCurrentEquipment.mockRestore();

    taskManager.getCurrentTask.mockRestore();
    taskManager.isCurrentTaskChanging.mockRestore();

    entryProxy.existEntry.mockRestore();

    imageProxy.fetchImages.mockRestore();

    entryManager.getTaskEntries.mockRestore();
    entryManager.areEntriesLoading.mockRestore();
    entryManager.onEntrySaved.mockReset();
    entryManager.onEntryDeleted.mockReset();
  });

  function assertTableSortedByDate(table) {
    const cells = table.find('ClickableCell');
    let previousDate;
    for (let i = 0; i < entries.length; i++) {
      for (let numColumn = 0; numColumn < nbColumn; numColumn++) {
        const currentDate = cells.at(i * nbColumn + numColumn).props().data.date;

        if (previousDate !== undefined && currentDate !== previousDate) {
          assert.afterTime(previousDate, currentDate);
        }

        previousDate = currentDate;
      }
    }
  }

  it('Should render render the loading spinner while loading the entries', async () => {
    // Arrange
    entryManager.areEntriesLoading.mockImplementation(() => true);

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );

    // Assert
    expect(historyTaskTable.find('tbody').length).toBe(0);
    expect(historyTaskTable.find('Loading').length).toBe(1);
    expect(entryManager.getTaskEntries).toBeCalledTimes(1);

    expect(historyTaskTable).toMatchSnapshot();
  });

  it('Should render all the entries with the correct classnames for a task', async () => {
    // Arrange

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    const tbodyProps = historyTaskTable.find('tbody').at(0).props();
    for (let i = 0; i < entriesSortedByDate.length; i++) {
      expect(tbodyProps.children[i].props.data._uiId).toBe(entriesSortedByDate[entriesSortedByDate.length - 1 - i]._uiId);
    }
    const clickableCells = historyTaskTable.find('ClickableCell');
    clickableCells.forEach((clickableCell) => {
      const cellProps = clickableCell.props();
      const entry = cellProps.data;
      expect(cellProps.className.includes(entry.ack ? 'table-white' : 'table-warning')).toBe(true);
    });

    expect(entryManager.getTaskEntries).toBeCalledTimes(1);
    expect(historyTaskTable).toMatchSnapshot();
  });

  it('Should render an empty table even when the task is undefined', async () => {
    // Arrange
    taskManager.getCurrentTask.mockImplementation(() => undefined);
    entryManager.getTaskEntries.mockImplementation(() => []);

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    const tbodyProps = historyTaskTable.find('tbody').at(0).props();
    expect(tbodyProps.children.length).toBe(0);
    expect(entryManager.getTaskEntries).toBeCalledTimes(1);

    expect(historyTaskTable).toMatchSnapshot();
  });

  it('Should open the edition entry modal when clicking on any cell', async () => {
    // Arrange
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    const cells = historyTaskTable.find('ClickableCell');

    for (let i = 0; i < entriesSortedByDate.length; i++) {
      for (let numColumn = 0; numColumn < nbColumn; numColumn++) {
        // Act
        cells.at(i * nbColumn + numColumn).simulate('click');
        // eslint-disable-next-line no-await-in-loop
        await updateWrapper(historyTaskTable);

        // Assert
        const editEntryModal = historyTaskTable.find('ModalEditEntry');
        expect(editEntryModal.length).toBe(1);
        expect(editEntryModal.props().visible).toBe(true);
        expect(editEntryModal.props().equipment).toBe(equipment);
        expect(editEntryModal.props().task).toBe(task);
        expect(editEntryModal.props().entry._uiId).toEqual(entriesSortedByDate[entriesSortedByDate.length - 1 - i]._uiId);
      }
    }
  });

  it('Should display the entries from the most recent to the oldest by default', async () => {
    // Arrange

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    assertTableSortedByDate(historyTaskTable);
  });

  it('Should display an exclamation mark when the entry was acknowledged lately', async () => {
    // Arrange

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    const cell1 = historyTaskTable.find('ClickableCell').at(0 * nbColumn + 1);
    expect(cell1.props().data.isLate).toBe(false);
    expect(cell1.find('FontAwesomeIcon').length).toBe(0);

    const cell2 = historyTaskTable.find('ClickableCell').at(1 * nbColumn + 1);
    expect(cell2.props().data.isLate).toBe(false);
    expect(cell2.find('FontAwesomeIcon').length).toBe(0);

    const cell3 = historyTaskTable.find('ClickableCell').at(2 * nbColumn + 1);
    expect(cell3.props().data.isLate).toBe(false);
    expect(cell3.find('FontAwesomeIcon').length).toBe(0);

    const cell4 = historyTaskTable.find('ClickableCell').at(3 * nbColumn + 1);
    expect(cell4.props().data.isLate).toBe(true);
    expect(cell4.find('FontAwesomeIcon').length).toBe(1);
  });

  it('Should add an entry and it should remain sorted by date', async () => {
    // Arrange
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    const addButton = historyTaskTable.find('Button');
    addButton.simulate('click');
    await updateWrapper(historyTaskTable);

    const editEntryModal = historyTaskTable.find('ModalEditEntry');
    const { saveEntry } = editEntryModal.props();

    const newEntry = {
      _uiId: 'entry_088',
      name: 'remplacement silent bloc',
      date: new Date('2019-09-08T00:11:18.112Z'),
      age: 125894,
      remarks: 'RAS',
      taskUiId: task._uiId,
      equipmentUiId: equipment._uiId,
    };
    // Act
    saveEntry(newEntry);
    await updateWrapper(historyTaskTable);

    // Assert
    expect(editEntryModal.length).toBe(1);
    expect(editEntryModal.props().visible).toBe(true);
    expect(editEntryModal.props().equipment).toBe(equipment);

    expect(entryManager.onEntrySaved).toBeCalledTimes(1);
    expect(entryManager.onEntrySaved.mock.calls[0][0]).toBe(newEntry);
  });

  it('Should remove an entry', async () => {
    // Arrange
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    const cells = historyTaskTable.find('ClickableCell').at(5);
    cells.simulate('click');
    const entryToDelete = cells.props().data;
    await updateWrapper(historyTaskTable);

    const editEntryModal = historyTaskTable.find('ModalEditEntry');
    const { deleteEntry } = editEntryModal.props();

    // Act
    deleteEntry(entryToDelete);
    await updateWrapper(historyTaskTable);

    // Assert
    expect(editEntryModal.length).toBe(1);
    expect(editEntryModal.props().visible).toBe(true);
    expect(editEntryModal.props().equipment).toBe(equipment);
    expect(editEntryModal.props().entry).toBe(entryToDelete);

    expect(entryManager.onEntryDeleted).toBeCalledTimes(1);
    expect(entryManager.onEntryDeleted.mock.calls[0][0]).toBe(entryToDelete);
  });
});
