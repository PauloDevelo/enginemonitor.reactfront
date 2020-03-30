import ignoredMessages from '../../testHelpers/MockConsole';

import userProxy from '../UserProxy';
import taskProxy from '../TaskProxy';

import equipmentManager from '../EquipmentManager';
import taskManager from '../TaskManager';

import { TaskLevel } from '../../types/Types';

import { sleep } from '../../testHelpers/EnzymeHelper';

jest.mock('../TaskProxy');
jest.mock('../UserProxy');

describe('Test TaskManager', () => {
  const currentTaskListener = jest.fn();
  const tasksListener = jest.fn();

  const equipment = {
    _uiId: 'an id generated by the front 1',
    name: 'engine',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date(1979, 6, 1),
    ageAcquisitionType: 1,
    ageUrl: '',
  };

  const task1 = {
    _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end_1',
    name: 'Vidange',
    usagePeriodInHour: 500,
    periodInMonth: 12,
    description: "Changer l'huile",
    nextDueDate: new Date(2020, 3, 29),
    level: TaskLevel.done,
    usageInHourLeft: undefined,
  };

  const task2 = {
    _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end_2',
    name: 'Vidange',
    usagePeriodInHour: 500,
    periodInMonth: 12,
    description: "Changer l'huile",
    nextDueDate: new Date(2020, 3, 31),
    level: TaskLevel.done,
    usageInHourLeft: undefined,
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
    taskManager.registerOnCurrentTaskChanged(currentTaskListener);
    taskManager.registerOnTasksChanged(tasksListener);
  });

  beforeEach(() => {
    userProxy.getCredentials.mockImplementation(async () => ({ readonly: false }));
  });

  afterEach(async () => {
    taskProxy.fetchTasks.mockReset();
    userProxy.getCredentials.mockRestore();
    currentTaskListener.mockReset();

    await sleep(100);
    tasksListener.mockReset();
  });

  describe('getCurrentTask', () => {
    it('Should return undefined before setting the current equipment', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(() => Promise.resolve([]));

      equipmentManager.setCurrentEquipment(undefined);
      await sleep(200);

      // Act
      const currentTask = taskManager.getCurrentTask();

      // Assert
      expect(taskProxy.fetchTasks).toBeCalledTimes(0);
      expect(currentTask).toBeUndefined();
      done();
    });

    it('Should return undefined after setting a current equipment which does not have any task yet', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(() => Promise.resolve([]));
      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const currentTask = taskManager.getCurrentTask();

      // Assert
      expect(taskProxy.fetchTasks).toBeCalledTimes(1);
      expect(currentTask).toBeUndefined();
      done();
    });

    it('Should return the task which is the next to perform after setting the current equipment', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task2, task1]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const currentTask = taskManager.getCurrentTask();

      // Assert
      expect(taskProxy.fetchTasks).toBeCalledTimes(1);
      expect(currentTask).toEqual(task1);
      done();
    });

    it('Should return undefined when the current equipment is undefined.', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      equipmentManager.setCurrentEquipment(undefined);
      await sleep(200);

      // Act
      const currentTask = taskManager.getCurrentTask();

      // Assert
      expect(taskProxy.fetchTasks).toBeCalledTimes(1);
      expect(currentTask).toEqual(undefined);
      done();
    });
  });

  describe('setCurrentTask', () => {
    it('Should notify the listeners when the current task changed', async (done) => {
      // Arrange

      // Act
      taskManager.setCurrentTask(task1);

      // Assert
      expect(currentTaskListener).toBeCalledTimes(1);
      expect(currentTaskListener.mock.calls[0][0]).toBe(task1);
      done();
    });

    it('Should notify the listeners when the current task changed', async (done) => {
      // Arrange
      const anotherListener = jest.fn();
      taskManager.registerOnCurrentTaskChanged(anotherListener);

      // Act
      taskManager.setCurrentTask(task1);

      // Assert
      expect(anotherListener).toBeCalledTimes(1);
      expect(anotherListener.mock.calls[0][0]).toBe(task1);

      taskManager.unregisterOnCurrentTaskChanged(anotherListener);
      done();
    });

    it('Should not notify the unregister listener when the current task changed', async (done) => {
      // Arrange
      const anotherListener = jest.fn();
      taskManager.registerOnCurrentTaskChanged(anotherListener);

      taskManager.setCurrentTask(task1);
      taskManager.unregisterOnCurrentTaskChanged(anotherListener);

      // Act
      taskManager.setCurrentTask(task2);

      // Assert
      expect(anotherListener).toBeCalledTimes(1);
      expect(anotherListener.mock.calls[0][0]).toBe(task1);

      done();
    });
  });

  describe('getTasks', () => {
    it('should return the tasks fetched', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const tasks = taskManager.getTasks();

      // Assert
      expect(tasks.length).toBe(2);
      expect(tasks[0]).toBe(task1);
      expect(tasks[1]).toBe(task2);
      done();
    });

    it('should return the tasks sorted by due date', async (done) => {
      // Arrange
      const taskTodo = {
        _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end_3',
        name: 'Vidange',
        usagePeriodInHour: 500,
        periodInMonth: 12,
        description: "Changer l'huile",
        nextDueDate: new Date(2020, 4, 10),
        level: TaskLevel.todo,
        usageInHourLeft: undefined,
      };

      const taskSoon = {
        _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end_3',
        name: 'Vidange',
        usagePeriodInHour: 500,
        periodInMonth: 12,
        description: "Changer l'huile",
        nextDueDate: new Date(2020, 4, 10),
        level: TaskLevel.soon,
        usageInHourLeft: undefined,
      };

      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task2, task1, taskSoon, taskTodo]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const tasks = taskManager.getTasks();

      // Assert
      expect(tasks.length).toBe(4);
      expect(tasks[0]).toBe(taskTodo);
      expect(tasks[1]).toBe(taskSoon);
      expect(tasks[2]).toBe(task1);
      expect(tasks[3]).toBe(task2);
      done();
    });
  });

  describe('getTask', () => {
    it('should return the correct task', async () => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const task = taskManager.getTask(task1._uiId);

      // Assert
      expect(task).toBe(task1);
    });

    it('should return undefined when the uiid is incorrect', async () => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const task = taskManager.getTask('an incorrect task ui id');

      // Assert
      expect(task).toBe(undefined);
    });
  });

  describe('onTaskDeleted', () => {
    it('should remove the task from the list and it should notify the listeners', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      taskManager.onTaskDeleted(task1);

      // Assert
      const tasks = taskManager.getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toBe(task2);
      expect(tasksListener).toBeCalledTimes(2);
      done();
    });

    it('should not notify the unregistered listeners', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      const anotherTasksListener = jest.fn();
      taskManager.registerOnTasksChanged(anotherTasksListener);

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      taskManager.unregisterOnTasksChanged(anotherTasksListener);

      // Act
      taskManager.onTaskDeleted(task1);

      // Assert
      expect(anotherTasksListener).toBeCalledTimes(1);
      done();
    });

    it('should change the curren task when the current task is delelted', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      taskManager.setCurrentTask(task1);

      // Act
      taskManager.onTaskDeleted(task1);

      // Assert
      expect(taskManager.getCurrentTask()).toBe(task2);
      done();
    });
  });

  describe('onTaskSaved', () => {
    it('should add the task from the list and it should notify the listeners', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      const task3 = {
        _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end_3',
        name: 'Vidange',
        usagePeriodInHour: 500,
        periodInMonth: 12,
        description: "Changer l'huile",
        nextDueDate: new Date(2020, 4, 10),
        level: TaskLevel.done,
        usageInHourLeft: undefined,
      };

      // Act
      taskManager.onTaskSaved(task3);

      // Assert
      const tasks = taskManager.getTasks();
      expect(tasks.length).toBe(3);
      expect(tasks[2]).toEqual(task3);
      expect(tasksListener).toBeCalledTimes(2);
      done();
    });

    it('should update the task from the list and it should notify the listeners', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      const copytask1 = { ...task1 };
      copytask1.description = 'new description';

      // Act
      taskManager.onTaskSaved(copytask1);

      // Assert
      const tasks = taskManager.getTasks();
      expect(tasks.length).toBe(2);
      expect(tasks[0]).toEqual(copytask1);
      expect(tasksListener).toBeCalledTimes(2);
      done();
    });
  });

  describe('refreshTask', () => {
    it('should call refresh the task list and notify the listeners', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => Promise.resolve([task1, task2]));

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      taskManager.refreshTasks();
      await sleep(200);

      // Assert
      expect(tasksListener).toBeCalledTimes(2);
      expect(taskProxy.fetchTasks).toBeCalledTimes(2);
      done();
    });
  });

  describe('areTaskLoading', () => {
    it('should be true when fetching the tasks', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => {
        await sleep(500);
        return Promise.resolve([task1, task2]);
      });

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const areTasksLoading1 = taskManager.areTasksLoading();
      await sleep(700);
      const areTasksLoading2 = taskManager.areTasksLoading();

      // Assert
      expect(areTasksLoading1).toBe(true);
      expect(areTasksLoading2).toBe(false);
      done();
    });

    it('should be false after fetching the tasks unsuccessfully', async (done) => {
      // Arrange
      taskProxy.fetchTasks.mockImplementation(async () => {
        await sleep(500);
        return Promise.reject(new Error('an unexpected error'));
      });

      equipmentManager.setCurrentEquipment(equipment);
      await sleep(200);

      // Act
      const areTasksLoading1 = taskManager.areTasksLoading();
      await sleep(700);
      const areTasksLoading2 = taskManager.areTasksLoading();

      // Assert
      expect(areTasksLoading1).toBe(true);
      expect(areTasksLoading2).toBe(false);
      done();
    });
  });
});