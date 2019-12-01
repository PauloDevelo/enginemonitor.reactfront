import * as TaskHelper from '../TaskHelper';
import timeService from '../../services/TimeService';
import proxyEquipment from '../../services/EquipmentProxy';
import proxyEntry from '../../services/EntryProxy';

import { AgeAcquisitionType, TaskLevel } from '../../types/Types';

jest.mock('../../services/TimeService');
jest.mock('../../services/EquipmentProxy');
jest.mock('../../services/EntryProxy');

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

  afterEach(() => {
    proxyEquipment.getStoredEquipment.mockRestore();
  });

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

  const shortenItems = [
    { input: 'Bonjour comment allez-vous ce beau matin a Krabi in Thailande a bord du voilier Arbutus ?', output: 'Bonjour comment allez-vous ce beau matin a Krabi in Thailande a bord du voilier  ...' },
    { input: 'Allo ?', output: 'Allo ?' },
  ];
  describe.each(shortenItems)('shorten', ({ input, output }) => {
    it('should shorten a too long string', () => {
      // Act
      const result = TaskHelper.shorten(input);

      // Assert
      expect(result).toEqual(output);
    });
  });

  describe('updateTask', () => {
    it('should set usagePeriodInHour undefined if we get -1 from the server', () => {
      // Arrange
      const newTask = TaskHelper.createDefaultTask(equipment);
      newTask.usagePeriodInHour = -1;

      // Act
      const updateTask = TaskHelper.updateTask(newTask);

      // Assert
      expect(updateTask.usagePeriodInHour).toBeUndefined();
    });

    it('should set usagePeriodInHour undefined if we get undefined from the server', () => {
      // Arrange
      const newTask = TaskHelper.createDefaultTask(equipment);
      newTask.usagePeriodInHour = undefined;

      // Act
      const updateTask = TaskHelper.updateTask(newTask);

      // Assert
      expect(updateTask.usagePeriodInHour).toBeUndefined();
    });

    it('should set the same usagePeriodInHour then the server', () => {
      // Arrange
      const newTask = TaskHelper.createDefaultTask(equipment);
      newTask.usagePeriodInHour = 200;

      // Act
      const updateTask = TaskHelper.updateTask(newTask);

      // Assert
      expect(updateTask.usagePeriodInHour).toBe(200);
    });
  });

  describe('updateRealtimeFields', () => {
    it('should do nothing when the parent equipment cannot be found', () => {
      // Arrange
      jest.spyOn(proxyEquipment, 'getStoredEquipment').mockImplementation(() => [equipment]);
      const task = TaskHelper.createDefaultTask(equipment);

      // Act
      const updatedTask = TaskHelper.updateRealtimeFields('equipment_02', task);

      // Assert
      expect(updatedTask.nextDueDate).toBeUndefined();
      expect(updatedTask.usageInHourLeft).toBeUndefined();
      expect(updatedTask.level).toBeUndefined();
    });

    describe('the next due date', () => {
      it('should be using the equipment installation date when there is no entry yet', async () => {
        // Arrange
        const task = TaskHelper.createDefaultTask(equipment);
        task.periodInMonth = 3;

        jest.spyOn(proxyEquipment, 'getStoredEquipment').mockImplementation(() => [equipment]);
        jest.spyOn(proxyEntry, 'getStoredEntries').mockImplementation(() => []);

        // Act
        const updatedTask = await TaskHelper.updateRealtimeFields('equipment_01', task);

        // Assert
        expect(updatedTask.nextDueDate).toEqual(new Date(2011, 10, 29, 18, 36));
      });
    });

    describe('usageInHourLeft', () => {
      it('should compute undefined since the usagePeriodInHour is not defined or negative', async () => {
        // Arrange
        const task = TaskHelper.createDefaultTask(equipment);
        task.usagePeriodInHour = -1;

        jest.spyOn(proxyEquipment, 'getStoredEquipment').mockImplementation(() => [equipment]);
        jest.spyOn(proxyEntry, 'getStoredEntries').mockImplementation(() => []);

        // Act
        const updatedTask = await TaskHelper.updateRealtimeFields('equipment_01', task);

        // Assert
        expect(updatedTask.usageInHourLeft).toBeUndefined();
      });
    });

    describe('level', () => {
      it('should be todo since the next due date is over', async () => {
        // Arrange
        const task = TaskHelper.createDefaultTask(equipment);
        task.periodInMonth = 3;

        jest.spyOn(proxyEquipment, 'getStoredEquipment').mockImplementation(() => [equipment]);
        jest.spyOn(proxyEntry, 'getStoredEntries').mockImplementation(() => []);

        // Act
        const updatedTask = await TaskHelper.updateRealtimeFields('equipment_01', task);

        // Assert
        expect(updatedTask.nextDueDate).toEqual(new Date(2011, 10, 29, 18, 36));
        expect(updatedTask.level).toEqual(TaskLevel.todo);
      });
    });
  });
});
