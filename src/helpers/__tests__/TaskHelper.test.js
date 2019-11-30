import * as TaskHelper from '../TaskHelper';
import timeService from '../../services/TimeService';

import { AgeAcquisitionType, TaskLevel } from '../../types/Types';

jest.mock('../../services/TimeService');

describe('TaskHelper', () => {
  const equipment = {
    _uiId: 'equipment_01',
    name: 'engine',
    brand: 'nanni',
    model: 'N3.30',
    age: 1234,
    installation: new Date(2011, 7, 29, 18, 36),
    ageAcquisitionType: AgeAcquisitionType.time,
    ageUrl: '',
  };

  describe('createDefaultTask', () => {
    it('should create a task with the current time for the next due date and without usage period when the equipment uses the time for the usage', () => {
      // Arrange
      const currentTime = new Date(2019, 10, 29, 18, 36);
      jest.spyOn(timeService, 'getUTCDateTime').mockReturnValue(currentTime);

      // Act
      const newTask = TaskHelper.createDefaultTask(equipment);

      // Assert
      expect(newTask.usagePeriodInHour).toBe(-1);
      expect(newTask.nextDueDate).toEqual(currentTime);
      expect(timeService.getUTCDateTime).toHaveBeenCalledTimes(1);
    });
  });

  const getBadgeTextItems = [
    { level: TaskLevel.done, expectedResult: 'Done' },
    { level: TaskLevel.soon, expectedResult: 'Soon' },
    { level: TaskLevel.todo, expectedResult: 'ToDo' },
  ];
  describe.each(getBadgeTextItems)('getBadgeText', ({ level, expectedResult }) => {
    it(`should return ${expectedResult} for the level ${level}`, () => {
      expect(TaskHelper.getBadgeText(level)).toEqual(expectedResult);
    });
  });

  const getContextItems = [
    { level: TaskLevel.done, expectedResult: 'success' },
    { level: TaskLevel.soon, expectedResult: 'warning' },
    { level: TaskLevel.todo, expectedResult: 'danger' },
    { level: 4, expectedResult: 'primary' },
  ];
  describe.each(getContextItems)('getContext', ({ level, expectedResult }) => {
    it(`should return ${expectedResult} for the level ${level}`, () => {
      expect(TaskHelper.getContext(level)).toEqual(expectedResult);
    });
  });

  const getColorItems = [
    { level: TaskLevel.done, expectedResult: '#C3E5CA' },
    { level: TaskLevel.soon, expectedResult: '#FFEEBA' },
    { level: TaskLevel.todo, expectedResult: '#F5C6CC' },
    { level: 4, expectedResult: 'white' },
  ];
  describe.each(getColorItems)('getColor', ({ level, expectedResult }) => {
    it(`should return ${expectedResult} for the level ${level}`, () => {
      expect(TaskHelper.getColor(level)).toEqual(expectedResult);
    });
  });

  const getToDoValueItems = [
    {
      ageAcquisitionType: AgeAcquisitionType.time, usageInHourLeft: 150, usagePeriodInHour: 200, expectedOnlyDate: true,
    },
    {
      ageAcquisitionType: AgeAcquisitionType.tracker, usageInHourLeft: 150, usagePeriodInHour: 200, expectedOnlyDate: false,
    },
    {
      ageAcquisitionType: AgeAcquisitionType.manualEntry, usageInHourLeft: 150, usagePeriodInHour: 200, expectedOnlyDate: false,
    },
    {
      ageAcquisitionType: AgeAcquisitionType.manualEntry, usageInHourLeft: undefined, usagePeriodInHour: 200, expectedOnlyDate: true,
    },
    {
      ageAcquisitionType: AgeAcquisitionType.manualEntry, usageInHourLeft: 150, usagePeriodInHour: undefined, expectedOnlyDate: true,
    },
  ];
  describe.each(getToDoValueItems)('getTodoValue', ({
    ageAcquisitionType, usageInHourLeft, usagePeriodInHour, expectedOnlyDate,
  }) => {
    it(`should return ${expectedOnlyDate} when the age acquisition is ${ageAcquisitionType}, the task usageInHourLeft is ${usageInHourLeft}, and the task usage period is ${usagePeriodInHour}`, () => {
      // Arrange
      const equ = { ...equipment };
      equ.ageAcquisitionType = ageAcquisitionType;

      const task = TaskHelper.createDefaultTask(equ);
      task.usageInHourLeft = usageInHourLeft;
      task.usagePeriodInHour = usagePeriodInHour;

      // Act
      const todo = TaskHelper.getTodoValue(equ, task);

      // assert
      expect(todo.onlyDate).toEqual(expectedOnlyDate);
    });
  });
});
