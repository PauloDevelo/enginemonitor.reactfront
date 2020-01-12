import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import taskProxy from '../TaskProxy';
import entryProxy from '../EntryProxy';
import equipmentProxy from '../EquipmentProxy';
import imageProxy from '../ImageProxy';
import actionManager from '../ActionManager';

import { updateTask } from '../../helpers/TaskHelper';
import { TaskLevel, AgeAcquisitionType } from '../../types/Types';

jest.mock('../HttpProxy');
jest.mock('../SyncService');
jest.mock('../EntryProxy');
jest.mock('../ImageProxy');
jest.mock('../EquipmentProxy');

describe('Test TaskProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function TaskProxy.existTask expects a non null and non undefined task id.');
    ignoredMessages.push('read property');
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
    httpProxy.get.mockReset();

    const user = { email: 'test@gmail.com' };
    storageService.openUserStorage(user);
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchTask, undefined);
    storageService.closeUserStorage();

    entryProxy.onTaskDeleted.mockRestore();
    entryProxy.getStoredEntries.mockRestore();
    imageProxy.onEntityDeleted.mockRestore();
    equipmentProxy.getStoredEquipment.mockRestore();
  });

  describe('fetchTasks', () => {
    it('should return an empty array if the equipment parent is undefined', async () => {
      // Arrange

      // Act
      const tasks = await taskProxy.fetchTasks({ equipmentId: undefined, forceToLookUpInStorage: false });

      // Assert
      expect(tasks.length).toBe(0);
    });

    it('should return the expected tasks and it should update the realtime fields', async () => {
      // Arrange
      entryProxy.getStoredEntries.mockImplementation(async () => Promise.resolve([]));
      equipmentProxy.getStoredEquipment.mockImplementation(async () => Promise.resolve([{
        _uiId: parentEquipmentId,
        name: 'engine',
        brand: 'nanni',
        model: 'N3.30',
        age: 1234,
        installation: new Date(2011, 7, 29, 18, 36),
        ageAcquisitionType: AgeAcquisitionType.time,
        ageUrl: '',
      }]));

      httpProxy.get.mockImplementation(() => (
        {
          tasks: [
            {
              _uiId: 'task_01',
              name: 'Vidange',
              usagePeriodInHour: 500,
              periodInMonth: 12,
              description: "Changer l'huile",
            },
            {
              _uiId: 'task_02',
              name: 'Change the impeller',
              usagePeriodInHour: 800,
              periodInMonth: 24,
              description: "Changer l'impeller de la pompe a eau de mer",
            },
          ],
        }
      ));
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));

      // Act
      const tasks = await taskProxy.fetchTasks({ equipmentId: parentEquipmentId, forceToLookUpInStorage: false });

      // Assert
      expect(tasks.length).toBe(2);
      expect(tasks[0].nextDueDate).not.toBeUndefined();
      expect(tasks[0].usageInHourLeft).not.toBeUndefined();
      expect(tasks[0].level).not.toBeUndefined();

      expect(tasks[1].nextDueDate).not.toBeUndefined();
      expect(tasks[1].usageInHourLeft).not.toBeUndefined();
      expect(tasks[1].level).not.toBeUndefined();
    });
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

  describe('onEquipmentDeleted', () => {
    it('should call removeItemInArray, onTaskDeleted for entry proxy and onEntityDeleted for the imageProxy', async () => {
      // Arrange
      const { getArray, removeItemInArray } = storageService;

      const getArrayMock = jest.fn().mockImplementation(() => Promise.resolve([
        {
          _uiId: 'task_01',
          name: 'Vidange',
          usagePeriodInHour: 500,
          periodInMonth: 12,
          description: "Changer l'huile",
          nextDueDate: new Date(),
          level: TaskLevel.done,
          usageInHourLeft: undefined,
        },
        {
          _uiId: 'task_02',
          name: 'Change the impeller',
          usagePeriodInHour: 800,
          periodInMonth: 24,
          description: "Changer l'impeller de la pompe a eau de mer",
          nextDueDate: new Date(),
          level: TaskLevel.done,
          usageInHourLeft: undefined,
        },
      ]));
      const removeItemInArrayMock = jest.fn();

      storageService.getArray = getArrayMock;
      storageService.removeItemInArray = removeItemInArrayMock;

      jest.spyOn(entryProxy, 'onTaskDeleted');
      jest.spyOn(imageProxy, 'onEntityDeleted');

      // Act
      await taskProxy.onEquipmentDeleted(parentEquipmentId);

      // Assert
      expect(removeItemInArrayMock).toHaveBeenCalledTimes(2);
      expect(removeItemInArrayMock.mock.calls[0][0]).toEqual(urlFetchTask);
      expect(removeItemInArrayMock.mock.calls[0][1]).toEqual('task_01');
      expect(removeItemInArrayMock.mock.calls[1][0]).toEqual(urlFetchTask);
      expect(removeItemInArrayMock.mock.calls[1][1]).toEqual('task_02');

      expect(entryProxy.onTaskDeleted).toHaveBeenCalledTimes(2);
      expect(entryProxy.onTaskDeleted.mock.calls[0][0]).toEqual(parentEquipmentId);
      expect(entryProxy.onTaskDeleted.mock.calls[0][1]).toEqual('task_01');
      expect(entryProxy.onTaskDeleted.mock.calls[1][0]).toEqual(parentEquipmentId);
      expect(entryProxy.onTaskDeleted.mock.calls[1][1]).toEqual('task_02');

      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(2);
      expect(imageProxy.onEntityDeleted.mock.calls[0][0]).toEqual('task_01');
      expect(imageProxy.onEntityDeleted.mock.calls[1][0]).toEqual('task_02');

      storageService.removeItemInArray = removeItemInArray;
      storageService.getArray = getArray;
    });
  });
});
