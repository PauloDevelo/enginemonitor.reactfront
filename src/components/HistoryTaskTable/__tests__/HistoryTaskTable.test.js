import chai, { assert } from 'chai';

import React from 'react';
import { IntlProvider } from 'react-intl';

import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';
import imageProxy from '../../../services/ImageProxy';
import entryProxy from '../../../services/EntryProxy';

import { AgeAcquisitionType } from '../../../types/Types';
import HistoryTaskTable from '../HistoryTaskTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EntryProxy');
jest.mock('localforage');

chai.use(require('chai-datetime'));

describe('HistoryTaskTable', () => {
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
      age: 1234,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
    },
    {
      _uiId: 'entry_02',
      name: 'vidange inverseur',
      date: new Date('2019-11-06T00:11:18.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
    },
    {
      _uiId: 'entry_03',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:18.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
    },
    {
      _uiId: 'entry_04',
      name: 'vidange inverseur',
      date: new Date('2019-11-09T00:11:19.112Z'),
      age: 1214,
      remarks: 'RAS',
      taskUiId: 'task_01',
      equipmentUiId: 'equipment_01',
    },
  ];

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Missing message');
  });

  beforeEach(() => {
    jest.spyOn(entryProxy, 'fetchEntries').mockImplementation(async (props) => {
      if (props.taskId === 'task_01') {
        return Promise.resolve(entries);
      }
      return Promise.resolve([]);
    });

    jest.spyOn(entryProxy, 'existEntry').mockImplementation(async (equipmentId, entryId) => {
      if (entries.findIndex((e) => e._uiId === entryId) !== -1) {
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

  function assertTableSortedByDate(table) {
    const cells = table.find('ClickableCell');
    let previousDate;
    for (let i = 0; i < entries.length; i++) {
      for (let numColumn = 0; numColumn < 3; numColumn++) {
        const currentDate = cells.at(i * 3 + numColumn).props().data.date;

        if (previousDate !== undefined && currentDate !== previousDate) {
          assert.afterTime(previousDate, currentDate);
        }

        previousDate = currentDate;
      }
    }
  }

  it('Should render render the loading spinner while loading the entries', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
      </IntlProvider>,
    );

    // Assert
    expect(historyTaskTable.find('tbody').length).toBe(0);
    expect(historyTaskTable.find('Loading').length).toBe(1);
    expect(entryProxy.fetchEntries).toBeCalledTimes(1);
    expect(onHistoryChanged).toBeCalledTimes(0);

    expect(historyTaskTable).toMatchSnapshot();
  });

  it('Should render all the entries for a task', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    const tbodyProps = historyTaskTable.find('tbody').at(0).props();
    for (let i = 0; i < entries.length; i++) {
      expect(tbodyProps.children[i].props.data).toBe(entries[i]);
    }
    expect(entryProxy.fetchEntries).toBeCalledTimes(1);
    expect(onHistoryChanged).toBeCalledTimes(0);

    expect(onHistoryChanged).toMatchSnapshot();
  });

  it('Should render an empty table even when the task is undefined', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={undefined}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    const tbodyProps = historyTaskTable.find('tbody').at(0).props();
    expect(tbodyProps.children.length).toBe(0);
    expect(entryProxy.fetchEntries).toBeCalledTimes(1);
    expect(onHistoryChanged).toBeCalledTimes(0);

    expect(onHistoryChanged).toMatchSnapshot();
  });

  it('Should rerender all the entries for a task when equipmentHistoryRefreshId change', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    const properties = {
      equipment, task, onHistoryChanged, taskHistoryRefreshId: 0,
    };
    const wrapper = mount(
      React.createElement(
        (props) => (
          <IntlProvider locale={navigator.language}>
            <HistoryTaskTable
              {...props}
            />
          </IntlProvider>
        ),
        properties,
      ),
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

  it('Should open the edition entry modal when clicking on any cell', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    const cells = historyTaskTable.find('ClickableCell');

    for (let i = 0; i < entries.length; i++) {
      for (let numColumn = 0; numColumn < 3; numColumn++) {
        // Act
        cells.at(i * 3 + numColumn).simulate('click');
        // eslint-disable-next-line no-await-in-loop
        await updateWrapper(historyTaskTable);

        // Assert
        const editEntryModal = historyTaskTable.find('ModalEditEntry');
        expect(editEntryModal.length).toBe(1);
        expect(editEntryModal.props().visible).toBe(true);
        expect(editEntryModal.props().equipment).toBe(equipment);
        expect(editEntryModal.props().task).toBe(task);
        expect(editEntryModal.props().entry).toBe(entries[i]);
      }
    }
  });

  it('Should display the entries from the most recent to the oldest by default', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    // Act
    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
      </IntlProvider>,
    );
    await updateWrapper(historyTaskTable);

    // Assert
    assertTableSortedByDate(historyTaskTable);
  });

  it('Should add an entry and it should remain sorted by date', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
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

    expect(historyTaskTable.find('ClickableCell').length).toBe((entries.length + 1) * 3);
    const newCells = historyTaskTable.find('ClickableCell').findWhere((n) => n.props().data === newEntry);
    expect(newCells.length).toBe(3);

    assertTableSortedByDate(historyTaskTable);
    expect(onHistoryChanged).toBeCalledTimes(1);
  });

  it('Should remove an entry', async () => {
    // Arrange
    const onHistoryChanged = jest.fn();

    const historyTaskTable = mount(
      <IntlProvider locale={navigator.language}>
        <HistoryTaskTable
          equipment={equipment}
          task={task}
          onHistoryChanged={onHistoryChanged}
          taskHistoryRefreshId={0}
        />
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

    expect(historyTaskTable.find('ClickableCell').length).toBe((entries.length - 1) * 3);
    const newCells = historyTaskTable.find('ClickableCell').findWhere((n) => n.props().data === entryToDelete);
    expect(newCells.length).toBe(0);

    expect(onHistoryChanged).toBeCalledTimes(1);
  });
});
