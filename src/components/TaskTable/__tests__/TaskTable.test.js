import chai from 'chai';

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

import equipmentManager from '../../../services/EquipmentManager';
import taskManager from '../../../services/TaskManager';

jest.mock('localforage');
jest.mock('../../../services/TaskProxy');
jest.mock('../../../services/EquipmentManager');
jest.mock('../../../services/TaskManager');

chai.use(require('chai-datetime'));

describe('TaskTable', () => {
  function getSortedTasks(taskArray) {
    const copyTaskArray = taskArray.concat([]);
    return copyTaskArray.sort((a, b) => a.nextDueDate - b.nextDueDate);
  }

  const resizeWindow = (width, height) => {
    window.innerWidth = width;
    window.innerHeight = height;
    window.dispatchEvent(new Event('resize'));
  };

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
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(() => {
    equipmentManager.getCurrentEquipment.mockImplementation(() => equipment);
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.areTasksLoading.mockImplementation(() => false);
  });

  afterEach(() => {
    taskProxy.existTask.mockReset();
    equipmentManager.getCurrentEquipment.mockRestore();
    taskManager.getTasks.mockRestore();
    taskManager.areTasksLoading.mockRestore();
  });

  it('Should render the table with te special class name', async (done) => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => []);
    taskManager.areTasksLoading.mockImplementation(() => true);

    const changeCurrentTask = jest.fn();

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          changeCurrentTask={changeCurrentTask}
          className="mySpecialClassName"
        />
      </IntlProvider>,
    );

    // Assert
    const table = taskTable.find('div').at(0);
    expect(table.props().className).toContain('mySpecialClassName');
    done();
  });

  it('Should render an empty table if the equipment is undefined', async (done) => {
    // Arrange
    const changeCurrentTask = jest.fn();

    equipmentManager.getCurrentEquipment.mockImplementation(() => undefined);
    taskManager.getTasks.mockImplementation(() => []);

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );
    await updateWrapper(taskTable);

    // Assert
    const tbodyProps = taskTable.find('tbody').at(0).props();
    expect(tbodyProps.children.length).toBe(0);

    expect(taskManager.onTaskSaved).toBeCalledTimes(0);
    expect(taskManager.setCurrentTask).toBeCalledTimes(0);
    expect(changeCurrentTask).toBeCalledTimes(0);
    done();
  });

  it('Should render all the tasks sorted by due date', async (done) => {
    // Arrange
    const changeCurrentTask = jest.fn();

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
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

    expect(taskManager.onTaskSaved).toBeCalledTimes(0);
    expect(changeCurrentTask).toBeCalledTimes(0);
    expect(taskManager.setCurrentTask).toBeCalledTimes(0);
    done();
  });

  it('Should call changeCurrentTask when clicking on any cell', async (done) => {
    // Arrange
    const changeCurrentTask = jest.fn();

    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
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

        expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(clickCounter + 1);
        expect(taskManager.setCurrentTask.mock.calls[clickCounter][0]).toBe(task);

        clickCounter++;
      }
    }
    done();
  });

  it('should display the task edition modal to add a new entry', async (done) => {
    // Arrange
    const changeCurrentTask = jest.fn();

    taskProxy.existTask.mockImplementation(async () => Promise.resolve(false));

    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
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
    expect(editTaskModal.props().onTaskSaved).toBe(taskManager.onTaskSaved);
    expect(taskManager.onTaskSaved).toBeCalledTimes(0);
    done();
  });

  it('it should display only 3 columns since the inner width is lower than 1200px, but after a resize larger than 1200px, it should display 4 columns', async (done) => {
    // Arrange
    window.innerWidth = 1000;
    const changeCurrentTask = jest.fn();

    // Act
    const taskTable = mount(
      <IntlProvider locale={navigator.language}>
        <TaskTable
          changeCurrentTask={changeCurrentTask}
        />
      </IntlProvider>,
    );
    await updateWrapper(taskTable);

    // Assert
    let cells = taskTable.find('ClickableCell');
    expect(cells.length).toBe(tasks.length * 3);

    // Act
    resizeWindow(1600, 1024);
    await updateWrapper(taskTable);

    // Assert
    cells = taskTable.find('ClickableCell');
    expect(cells.length).toBe(tasks.length * 4);

    // Act
    resizeWindow(1700, 1024);
    await updateWrapper(taskTable);

    // Assert
    cells = taskTable.find('ClickableCell');
    expect(cells.length).toBe(tasks.length * 4);

    // Act
    resizeWindow(1024, 768);
    await updateWrapper(taskTable);

    // Assert
    cells = taskTable.find('ClickableCell');
    expect(cells.length).toBe(tasks.length * 3);

    // Act
    resizeWindow(1000, 768);
    await updateWrapper(taskTable);

    // Assert
    cells = taskTable.find('ClickableCell');
    expect(cells.length).toBe(tasks.length * 3);
    done();
  });
});
