import React from 'react';
import { IntlProvider } from 'react-intl';

import { mount } from 'enzyme';

import ignoredMessages from '../../../testHelpers/MockConsole';

import TaskTabPanes from '../TaskTabPanes';
import entryProxy from '../../../services/EntryProxy';
import { TaskLevel } from '../../../types/Types';

import equipmentManager from '../../../services/EquipmentManager';
import taskManager from '../../../services/TaskManager';

jest.mock('../../../services/EntryProxy');
jest.mock('../../../services/EquipmentManager');
jest.mock('../../../services/TaskManager');

describe('TaskTabPanes', () => {
  const currentEquipment = {
    _uiId: 'an id generated by the front',
    name: 'engine',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date('2019-07-09T16:00:00.000Z'),
    ageAcquisitionType: 1,
    ageUrl: '',
  };

  const taskList = [
    {
      _uiId: 'task_01',
      name: 'Vidange',
      usagePeriodInHour: 500,
      periodInMonth: 12,
      description: "Changer l'huile",
      nextDueDate: new Date('2020-07-09T16:00:00.000Z'),
      level: TaskLevel.done,
      usageInHourLeft: undefined,
    },
    {
      _uiId: 'task_02',
      name: 'Change the impeller',
      usagePeriodInHour: 800,
      periodInMonth: 24,
      description: "Changer l'impeller de la pompe a eau de mer",
      nextDueDate: new Date('2021-07-09T16:00:00.000Z'),
      level: TaskLevel.done,
      usageInHourLeft: undefined,
    },
  ];

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('a test was not wrapped in act(...)');
  });

  beforeEach(() => {
    equipmentManager.getCurrentEquipment.mockImplementation(() => currentEquipment);
    taskManager.getTasks.mockImplementation(() => taskList);
  });

  afterEach(() => {
    entryProxy.fetchAllEntries.mockRestore();
    equipmentManager.getCurrentEquipment.mockRestore();
    taskManager.getTasks.mockRestore();
  });

  it('should render a TaskTabPanes with the task table selected', () => {
    // Arrange
    const changeCurrentTask = jest.fn();

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <TaskTabPanes changeCurrentTask={changeCurrentTask} />
      </IntlProvider>,
    );

    // Assert
    expect(wrapper.find('Memo(TaskTable)').length).toBe(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should select the equipment history', () => {
    // Arrange
    jest.spyOn(entryProxy, 'fetchAllEntries').mockImplementation(async () => Promise.resolve([]));
    const changeCurrentTask = jest.fn();

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <TaskTabPanes changeCurrentTask={changeCurrentTask} />
      </IntlProvider>,
    );

    const equipmentHistoryLink = wrapper.find('Memo(MyNavItem)').at(1);

    // Act
    equipmentHistoryLink.find('NavLink').simulate('click');
    wrapper.update();

    // Assert
    expect(wrapper.find('Memo(EquipmentHistoryTable)').length).toBe(1);
  });
});
