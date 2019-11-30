import * as TaskHelper from '../TaskHelper';
import timeService from '../../services/TimeService';

import { AgeAcquisitionType, TaskLevel } from '../../types/Types';

jest.mock('../../services/TimeService');

describe('TaskHelper', () => {
  describe('createDefaultTask', () => {
    it('should create a task with the current time for the next due date and without usage period when the equipment uses the time for the usage', () => {
      // Arrange
      const currentTime = new Date(2019, 10, 29, 18, 36);
      jest.spyOn(timeService, 'getUTCDateTime').mockReturnValue(currentTime);
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
});
