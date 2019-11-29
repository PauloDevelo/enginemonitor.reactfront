import chai, { assert } from 'chai';

import React from 'react';
import { IntlProvider } from 'react-intl';

import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';

import taskProxy from '../../../services/TaskProxy';

import { AgeAcquisitionType } from '../../../types/Types';
import TaskTable from '../TaskTable';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('localforage');
jest.mock('../../../services/TaskProxy');

chai.use(require('chai-datetime'));

describe('TaskTable', () => {
  function getSortedTasks(taskArray) {
    const copyTaskArray = taskArray.concat([]);
    return copyTaskArray.sort((a, b) => {
      if (a.nextDueDate > b.nextDueDate) {
        return -1;
      }
      if (a.nextDueDate < b.nextDueDate) {
        return 1;
      }
      return 0;
    });
  }

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

  const tasks = [{
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
  {
    _uiId: 'task_03',
    name: "change l'impeller",
    usagePeriodInHour: 800,
    periodInMonth: 24,
    description: "Change l'impeller",
    nextDueDate: new Date('2020-11-08T23:39:36.288Z'),
    level: 0,
    usageInHourLeft: 600,
  },
  {
    _uiId: 'task_04',
    name: 'change la courroie',
    usagePeriodInHour: 1000,
    periodInMonth: 24,
    description: 'Change la courroie de distribution',
    nextDueDate: new Date('2020-11-09T23:39:36.288Z'),
    level: 0,
    usageInHourLeft: 800,
  }];

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Missing message');
  });

  beforeEach(() => {
  });

  afterEach(() => {
    taskProxy.existTask.mockReset();
  });

  it('Should render render the loading spinner while loading the tasks', async () => {
    // Arrange
    const onTaskSaved = jest.fn();
    const changeCurrentTask = jest.fn();

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          equipment={equipment}
          tasks={[]}
          areTasksLoading
          onTaskSaved={onTaskSaved}
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );

    // Assert
    expect(taskTable.find('tbody').length).toBe(0);
    expect(taskTable.find('Loading').length).toBe(1);

    expect(onTaskSaved).toBeCalledTimes(0);
    expect(changeCurrentTask).toBeCalledTimes(0);

    expect(taskTable).toMatchSnapshot();
  });

  it('Should render all the tasks sorted by due date', async () => {
    // Arrange
    const onTaskSaved = jest.fn();
    const changeCurrentTask = jest.fn();

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          equipment={equipment}
          tasks={tasks}
          areTasksLoading={false}
          onTaskSaved={onTaskSaved}
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );
    await updateWrapper(taskTable);

    // Assert
    const sortedTasks = getSortedTasks(tasks);
    const tbodyProps = taskTable.find('tbody').at(0).props();
    sortedTasks.forEach((task, index) => {
      expect(tbodyProps.children[index].props.data.task).toBe(task);
    });

    expect(onTaskSaved).toBeCalledTimes(0);
    expect(changeCurrentTask).toBeCalledTimes(0);
  });


  it('Should call changeCurrentTask when clicking on any cell', async () => {
    // Arrange
    const onTaskSaved = jest.fn();
    const changeCurrentTask = jest.fn();

    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          equipment={equipment}
          tasks={tasks}
          areTasksLoading={false}
          onTaskSaved={onTaskSaved}
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );
    await updateWrapper(taskTable);

    const cells = taskTable.find('ClickableCell');

    const sortedTasks = getSortedTasks(tasks);
    let clickCounter = 0;
    for (let index = 0; index < sortedTasks.length; index++) {
      const task = sortedTasks[index];
      for (let numColumn = 0; numColumn < 3; numColumn++) {
        // Act
        cells.at(index * 3 + numColumn).simulate('click');
        // eslint-disable-next-line no-await-in-loop
        await updateWrapper(taskTable);

        // Assert
        expect(changeCurrentTask).toHaveBeenCalledTimes(clickCounter + 1);
        expect(changeCurrentTask.mock.calls[clickCounter][0]).toBe(task);

        clickCounter++;
      }
    }
  });

  it('should display the task edition modal to add a new entry', async () => {
    // Arrange
    const onTaskSaved = jest.fn();
    const changeCurrentTask = jest.fn();

    taskProxy.existTask.mockImplementation(async () => Promise.resolve(false));

    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          equipment={equipment}
          tasks={tasks}
          areTasksLoading={false}
          onTaskSaved={onTaskSaved}
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );
    await updateWrapper(taskTable);

    const createButton = taskTable.find('Button');

    // Act
    createButton.simulate('click');
    await updateWrapper(taskTable);

    // Assert
    const editTaskModal = taskTable.find('ModalEditTask');
    expect(editTaskModal.props().visible).toBe(true);
    expect(editTaskModal.props().onTaskSaved).toBe(onTaskSaved);
    expect(onTaskSaved).toBeCalledTimes(0);
  });

  // it('Should add an entry and it should remain sorted by date', async () => {
  //   // Arrange
  //   const onHistoryChanged = jest.fn();

  //   const historyTaskTable = mount(
  //     <IntlProvider locale={navigator.language}>
  //       <HistoryTaskTable
  //         equipment={equipment}
  //         task={task}
  //         onHistoryChanged={onHistoryChanged}
  //         taskHistoryRefreshId={0}
  //       />
  //     </IntlProvider>,
  //   );
  //   await updateWrapper(historyTaskTable);

  //   const addButton = historyTaskTable.find('Button');
  //   addButton.simulate('click');
  //   await updateWrapper(historyTaskTable);

  //   const editEntryModal = historyTaskTable.find('ModalEditEntry');
  //   const { saveEntry } = editEntryModal.props();

  //   const newEntry = {
  //     _uiId: 'entry_088',
  //     name: 'remplacement silent bloc',
  //     date: new Date('2019-09-08T00:11:18.112Z'),
  //     age: 125894,
  //     remarks: 'RAS',
  //     taskUiId: task._uiId,
  //     equipmentUiId: equipment._uiId,
  //   };
  //   // Act
  //   saveEntry(newEntry);
  //   await updateWrapper(historyTaskTable);

  //   // Assert
  //   expect(editEntryModal.length).toBe(1);
  //   expect(editEntryModal.props().visible).toBe(true);
  //   expect(editEntryModal.props().equipment).toBe(equipment);

  //   expect(historyTaskTable.find('ClickableCell').length).toBe((entries.length + 1) * 3);
  //   const newCells = historyTaskTable.find('ClickableCell').findWhere((n) => n.props().data === newEntry);
  //   expect(newCells.length).toBe(3);

  //   assertTableSortedByDate(historyTaskTable);
  //   expect(onHistoryChanged).toBeCalledTimes(1);
  // });

  // it('Should remove an entry', async () => {
  //   // Arrange
  //   const onHistoryChanged = jest.fn();

  //   const historyTaskTable = mount(
  //     <IntlProvider locale={navigator.language}>
  //       <HistoryTaskTable
  //         equipment={equipment}
  //         task={task}
  //         onHistoryChanged={onHistoryChanged}
  //         taskHistoryRefreshId={0}
  //       />
  //     </IntlProvider>,
  //   );
  //   await updateWrapper(historyTaskTable);

  //   const cells = historyTaskTable.find('ClickableCell').at(5);
  //   cells.simulate('click');
  //   const entryToDelete = cells.props().data;
  //   await updateWrapper(historyTaskTable);

  //   const editEntryModal = historyTaskTable.find('ModalEditEntry');
  //   const { deleteEntry } = editEntryModal.props();

  //   // Act
  //   deleteEntry(entryToDelete);
  //   await updateWrapper(historyTaskTable);

  //   // Assert
  //   expect(editEntryModal.length).toBe(1);
  //   expect(editEntryModal.props().visible).toBe(true);
  //   expect(editEntryModal.props().equipment).toBe(equipment);
  //   expect(editEntryModal.props().entry).toBe(entryToDelete);

  //   expect(historyTaskTable.find('ClickableCell').length).toBe((entries.length - 1) * 3);
  //   const newCells = historyTaskTable.find('ClickableCell').findWhere((n) => n.props().data === entryToDelete);
  //   expect(newCells.length).toBe(0);

  //   expect(onHistoryChanged).toBeCalledTimes(1);
  // });
});
