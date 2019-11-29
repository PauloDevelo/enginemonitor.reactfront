import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import taskProxy from '../TaskProxy';
import actionManager from '../ActionManager';

import { updateTask } from '../../helpers/TaskHelper';
import { TaskLevel } from '../../types/Types';


jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test TaskProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function TaskProxy.existTask expects a non null and non undefined task id.');
  });

  const parentEquipmentId = 'an_parent_equipment';
  const urlFetchTask = `${process.env.REACT_APP_URL_BASE}tasks/${parentEquipmentId}`;

  const taskToSave = {
    _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end',
    name: 'Vidange',
    usagePeriodInHour: 500,
    periodInMonth: 12,
    description: "Changer l'huile",
    nextDueDate: new Date(),
    level: TaskLevel.done,
    usageInHourLeft: undefined,
  };

  beforeEach(() => {
    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.deleteReq.mockReset();

    const user = { email: 'test@gmail.com' };
    storageService.openUserStorage(user);
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchTask, undefined);
    storageService.closeUserStorage();
  });

  const createOrSaveTaskParams = [
    {
      isOnline: false, expectedPostCounter: 0, equipmentId: parentEquipmentId, expectedNbTask: 1, expectedNbAction: 1,
    },
    {
      isOnline: true, expectedPostCounter: 1, equipmentId: parentEquipmentId, expectedNbTask: 1, expectedNbAction: 0,
    },
  ];
  describe.each(createOrSaveTaskParams)('createOrSaveTask', (arg) => {
    it(`When ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      let postCounter = 0;
      httpProxy.post.mockImplementation((url, data) => {
        postCounter++;
        return Promise.resolve(data);
      });

      // Act
      const taskSaved = await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

      // Assert
      expect(postCounter).toBe(arg.expectedPostCounter);
      expect(taskSaved).toEqual(taskToSave);

      const tasks = await storageService.getItem(urlFetchTask);
      expect(tasks.length).toBe(arg.expectedNbTask);

      if (arg.expectedNbTask > 0) {
        const storedTask = updateTask(tasks[0]);
        expect(storedTask).toEqual(taskToSave);
      }

      expect(await actionManager.countAction()).toBe(arg.expectedNbAction);
    });
  });

  const deleteTaskParams = [
    {
      isOnline: false, expectedDeleteCounter: 0, equipmentId: parentEquipmentId, expectedNbTask: 0, expectedNbAction: 2,
    },
    {
      isOnline: true, expectedDeleteCounter: 1, equipmentId: parentEquipmentId, expectedNbTask: 0, expectedNbAction: 0,
    },
  ];
  describe.each(deleteTaskParams)('deleteTask', (arg) => {
    it(`When ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      let deleteCounter = 0;
      httpProxy.deleteReq.mockImplementation(() => {
        deleteCounter++;
        return Promise.resolve({ task: { name: 'a task name' } });
      });

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await taskProxy.createOrSaveTask(arg.equipmentId, taskToSave);

      // Act
      const taskDeleted = await taskProxy.deleteTask(arg.equipmentId, taskToSave._uiId);

      // Assert
      expect(deleteCounter).toBe(arg.expectedDeleteCounter);
      expect(taskDeleted).toEqual(taskToSave);

      const tasks = await storageService.getItem(urlFetchTask);
      expect(tasks.length).toBe(arg.expectedNbTask);

      expect(await actionManager.countAction()).toBe(arg.expectedNbAction);
    });
  });

  const existEquipmentParams = [
    {
      isOnline: false, equipmentId: parentEquipmentId, taskId: taskToSave._uiId, expectedResult: true,
    },
    {
      isOnline: true, equipmentId: parentEquipmentId, taskId: 'task_id', expectedResult: false,
    },
    {
      isOnline: true, equipmentId: parentEquipmentId, taskId: undefined, expectedResult: false,
    },
  ];
  describe.each(existEquipmentParams)('existEquipment', (arg) => {
    it(`When ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

      await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

      // Act
      const isTaskExist = await taskProxy.existTask(arg.equipmentId, arg.taskId);

      // Assert
      expect(isTaskExist).toBe(arg.expectedResult);
    });
  });
});
