import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import taskProxy from '../TaskProxy';
import actionManager from '../ActionManager';

import { updateTask } from '../../helpers/TaskHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test TaskProxy', () => {
    const parentEquipmentId = "an_parent_equipment";
    const urlFetchTask = process.env.REACT_APP_URL_BASE + "tasks/" + parentEquipmentId;

    const taskToSave = { 
        _uiId: "an_id_created_by_the_front_end_and_for_the_front_end",
		name: 'Vidange',
		usagePeriodInHour: 500,
		periodInMonth: 12,
        description: "Changer l'huile",
        nextDueDate: new Date(),
        level: 0,
        usageInHourLeft: undefined,
    }

    beforeEach(() => {
        httpProxy.setConfig.mockReset();
        httpProxy.post.mockReset();
        httpProxy.deleteReq.mockReset();

        var user = { email: "test@gmail.com" };
        storageService.openUserStorage(user);
    });

    afterEach(async() => {
        await actionManager.clearActions();
        storageService.setItem(urlFetchTask, undefined);
        storageService.closeUserStorage();
    });

    describe('createOrSaveTask', () => {
        it("When offline, we should save the post query into history and save the new task into the storage", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(false);
            });

            let postCounter = 0;
            httpProxy.post.mockImplementation((url, data) => {
                postCounter++;
                return Promise.resolve(data);
            });

            // Act
            const taskSaved = await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

            // Assert
            expect(postCounter).toBe(0);
            expect(taskSaved).toEqual(taskToSave);

            const tasks = await storageService.getItem(urlFetchTask);
            expect(tasks.length).toBe(1);

            const storedTask = updateTask(tasks[0]);
            expect(storedTask).toEqual(taskToSave);

            expect(await actionManager.countAction()).toBe(1);
        });

        it("When online, we should send a post query and save the new equipment into the storage", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            let postCounter = 0;
            httpProxy.post.mockImplementation((url, data) => {
                postCounter++;
                return Promise.resolve(data);
            });

            // Act
            const taskSaved = await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

            // Assert
            expect(postCounter).toBe(1);
            expect(taskSaved).toEqual(taskToSave);

            const tasks = await storageService.getItem(urlFetchTask);
            expect(tasks.length).toBe(1);

            const storedTask = updateTask(tasks[0]);
            expect(storedTask).toEqual(taskToSave);

            expect(await actionManager.countAction()).toBe(0);
        });
    });

    describe('deleteTask', () => {
        it("When offline, the deletion should not send a http delete query but add an action in the action manager, and remove the task in the storage. ", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(false);
            });

            let postCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                postCounter++;
                return Promise.resolve({ task: { name: "a task name" } });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

            // Act
            const taskDeleted = await taskProxy.deleteTask(parentEquipmentId, taskToSave._uiId);

            // Assert
            expect(postCounter).toBe(0);
            expect(taskDeleted).toEqual(taskToSave);

            const tasks = await storageService.getItem(urlFetchTask);
            expect(tasks.length).toBe(0);

            expect(await actionManager.countAction()).toBe(2);
        });

        it("When online, the deletion should send a http delete query, remove the task in the storage and add none action in the action manager. ", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            let deleteReqCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteReqCounter++;
                return Promise.resolve({ task: { name: '....'} });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

            // Act
            const taskDeleted = await taskProxy.deleteTask(parentEquipmentId, taskToSave._uiId);

            // Assert
            expect(deleteReqCounter).toBe(1);
            expect(taskDeleted).toEqual(taskToSave);

            const tasks = await storageService.getItem(urlFetchTask);
            expect(tasks.length).toBe(0);

            expect(await actionManager.countAction()).toBe(0);
        });
    });

    describe('existEquipment', () => {
        it("When the task is in the storage, it should return true", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            await taskProxy.createOrSaveTask(parentEquipmentId, taskToSave);

            // Act
            const isTaskExist = await taskProxy.existTask(parentEquipmentId, taskToSave._uiId);

            // Assert
            expect(isTaskExist).toBe(true);
        });

        it("When the task is in the storage, it should return true", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            // Act
            const isTaskExist = await taskProxy.existTask(parentEquipmentId, taskToSave._uiId);

            // Assert
            expect(isTaskExist).toBe(false);
        });

        it("When the task does not have _uiId valid, it should return false", async() => {
            // Arrange


            // Act
            const isTaskExist = await taskProxy.existTask(parentEquipmentId, undefined);

            // Assert
            expect(isTaskExist).toBe(false);
        });
    });
});



