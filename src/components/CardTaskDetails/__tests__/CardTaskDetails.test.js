import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import ignoredMessages from '../../../testHelpers/MockConsole';

import imageProxy from '../../../services/ImageProxy';
import equipmentManager from '../../../services/EquipmentManager';
import taskManager from '../../../services/TaskManager';

import CardTaskDetails from '../CardTaskDetails';

jest.mock('../../../services/ImageProxy');
jest.mock('../../../services/EquipmentManager');
jest.mock('../../../services/TaskManager');

describe('CardTaskDetails', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  const equipment = {
    _uiId: '1234',
    name: 'engine',
    brand: 'nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date('2011-02-22T16:00:00.000Z'),
  };

  const task1 = {
    _uiId: 'task1',
    name: 'taskname1',
    periodInMonth: 12,
    description: 'task1 description',
    nextDueDate: new Date('2011-02-22T16:00:00.000Z'),
    usagePeriodInHour: 200,
    usageInHourLeft: 20,
    level: 1,
  };

  const task2 = {
    _uiId: 'task2',
    name: 'taskname2',
    periodInMonth: 24,
    description: 'task2 description',
    nextDueDate: new Date('2018-02-22T16:00:00.000Z'),
    usagePeriodInHour: 400,
    usageInHourLeft: 20,
    level: 3,
  };

  const tasks = [task1, task2];

  beforeEach(() => {
    imageProxy.fetchImages.mockResolvedValue([]);
    equipmentManager.getCurrentEquipment.mockImplementation(() => equipment);
  });

  afterEach(() => {
    imageProxy.fetchImages.mockRestore();
    equipmentManager.getCurrentEquipment.mockRestore();
    taskManager.getTasks.mockRestore();
    taskManager.getCurrentTask.mockRestore();

    taskManager.onTaskDeleted.mockClear();
    taskManager.onTaskSaved.mockClear();
    taskManager.setCurrentTask.mockClear();
  });

  it('Should render correctly even if the equipment is undefined', () => {
    // Arrange
    equipmentManager.getCurrentEquipment.mockImplementation(() => undefined);
    taskManager.getTasks.mockImplementation(() => []);
    taskManager.getCurrentTask.mockImplementation(() => undefined);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);
  });

  it('Should render correctly even if the task array is empty', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => []);
    taskManager.getCurrentTask.mockImplementation(() => undefined);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);
  });

  it('Should render correctly even if the current task is undefined', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => undefined);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);
  });

  it('Should render the task 1 details', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task1);

    // Act
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Assert
    expect(wrapper.find('.card-title').text()).toEqual(`${task1.name} Done`);
    expect(wrapper.find('.badge-success').text()).toEqual('Done');
    expect(wrapper.find('.card-control-prev-icon').hasClass('invisible')).toEqual(true);
    expect(wrapper.find('.card-text').text()).toEqual(task1.description);
    expect(wrapper.find('.card-control-next-icon').hasClass('invisible')).toEqual(false);

    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);

    expect(wrapper).toMatchSnapshot();
  });

  it('Should render the task 2 details', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task2);

    // Act
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Assert
    expect(wrapper.find('.card-title').text()).toEqual(`${task2.name} ToDo`);
    expect(wrapper.find('.badge-danger').text()).toEqual('ToDo');
    expect(wrapper.find('.card-control-prev-icon').hasClass('invisible')).toEqual(false);
    expect(wrapper.find('.card-text').text()).toEqual(task2.description);
    expect(wrapper.find('.card-control-next-icon').hasClass('invisible')).toEqual(true);

    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);

    expect(wrapper).toMatchSnapshot();
  });

  it('Should call changeCurrentTask after clicking on the next button', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task1);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Act
    wrapper.find('.button-next-task').simulate('click');

    // Assert
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(1);
    expect(taskManager.setCurrentTask.mock.calls[0][0]).toBe(task2);
  });

  it('Should not call changeCurrentTask after clicking on the next button because task2 is the last task', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task2);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Act
    wrapper.find('.button-next-task').simulate('click');

    // Assert
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);
  });

  it('Should not call changeCurrentTask after clicking on the prev button because task1 is the first task', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task1);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Act
    wrapper.find('.button-previous-task').simulate('click');

    // Assert
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(0);
  });

  it('Should call changeCurrentTask after clicking on the prev button', () => {
    // Arrange
    taskManager.getTasks.mockImplementation(() => tasks);
    taskManager.getCurrentTask.mockImplementation(() => task2);

    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><CardTaskDetails /></IntlProvider>);

    // Act
    wrapper.find('.button-previous-task').simulate('click');

    // Assert
    expect(taskManager.setCurrentTask).toHaveBeenCalledTimes(1);
    expect(taskManager.setCurrentTask.mock.calls[0][0]).toBe(task1);
    expect(taskManager.onTaskSaved).toHaveBeenCalledTimes(0);
    expect(taskManager.onTaskDeleted).toHaveBeenCalledTimes(0);
  });
});
