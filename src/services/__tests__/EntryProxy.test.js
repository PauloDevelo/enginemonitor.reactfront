import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import entryProxy from '../EntryProxy';
import actionManager from '../ActionManager';

import { updateEntry } from '../../helpers/EntryHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test EntryProxy', () => {
    const parentEquipmentId = "an_parent_equipment";
    const parentTaskId = "a_parent_task_id";
    const urlFetchEntry = process.env.REACT_APP_URL_BASE + "entries/" + parentEquipmentId;

    const entryToSave = {
		_uiId: "an_entry_id",
		name: "vidange",
		date: new Date(),
		age: 400,
		remarks: 'oil was clean',
		taskUiId: parentTaskId,
		equipmentUiId: parentEquipmentId
    }
    
    function mockHttpProxy(){
        httpProxy.setConfig.mockReset();
        httpProxy.post.mockReset();
        httpProxy.deleteReq.mockReset();
    }

    function initStorage(){
        var user = { email: "test@gmail.com" };
        storageService.openUserStorage(user);
    }

    async function clearStorage(){
        await actionManager.clearActions();
        storageService.setItem(urlFetchEntry, undefined);
        storageService.closeUserStorage();
    }

    beforeEach(() => {
        mockHttpProxy();
        initStorage();
    });

    afterEach(async() => {
        clearStorage();
    });

    const createOrSaveEntryParams = [ 
        {isOnline: false, taskId: parentTaskId, expectedPostCounter: 0, expectedNumberOfEntries: 1, expectedNumberOfAction: 1},
        {isOnline: true, taskId: parentTaskId, expectedPostCounter: 1, expectedNumberOfEntries: 1, expectedNumberOfAction: 0}
    ];

    describe.each(createOrSaveEntryParams)('createOrSaveEntry', async(arg) => {
        it("test when " + JSON.stringify(arg), async() => {
            // Arrange
            if(arg.expectedNumberOfEntries >= 1){
                expect.assertions(5);
            }
            else{
                expect.assertions(4);
            }
            
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(arg.isOnline);
            });

            let postCounter = 0;
            httpProxy.post.mockImplementation((url, data) => {
                postCounter++;
                return Promise.resolve(data);
            });

            // Act
            const entrySaved = await entryProxy.createOrSaveEntry(parentEquipmentId, arg.taskId, entryToSave);

            // Assert
            expect(postCounter).toBe(arg.expectedPostCounter);
            expect(entrySaved).toEqual(entryToSave);

            const entries = await storageService.getItem(urlFetchEntry);
            expect(entries.length).toBe(arg.expectedNumberOfEntries);

            if(arg.expectedNumberOfEntries >= 1){
                const storedEntry = updateEntry(entries[0]);
                expect(storedEntry).toEqual(entryToSave);
            }

            expect(await actionManager.countAction()).toBe(arg.expectedNumberOfAction);
        });
    });

    describe('deleteEntry', () => {
        it("When offline, the deletion should not send a http delete query but add an action in the action manager, and remove the entry in the storage. ", async () => {
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
            await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToSave);

            // Act
            const entryDeleted = await entryProxy.deleteEntry(parentEquipmentId, parentTaskId, entryToSave._uiId);

            // Assert
            expect(postCounter).toBe(0);
            expect(entryDeleted).toEqual(entryToSave);

            const entries = await storageService.getItem(urlFetchEntry);
            expect(entries.length).toBe(0);

            expect(await actionManager.countAction()).toBe(2);
        });

        it("When online, the deletion should send a http delete query, remove the entry in the storage and add none action in the action manager. ", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            let deleteReqCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteReqCounter++;
                return Promise.resolve({ entry: { name: '....'} });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToSave);

            // Act
            const entryDeleted = await entryProxy.deleteEntry(parentEquipmentId, parentTaskId, entryToSave._uiId);

            // Assert
            expect(deleteReqCounter).toBe(1);
            expect(entryDeleted).toEqual(entryToSave);

            const entries = await storageService.getItem(urlFetchEntry);
            expect(entries.length).toBe(0);

            expect(await actionManager.countAction()).toBe(0);
        });
    });

    describe('existEntry', () => {
        it("When the entry is in the storage, it should return true", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToSave);

            // Act
            const isEntryExist = await entryProxy.existEntry(parentEquipmentId, entryToSave._uiId);

            // Assert
            expect(isEntryExist).toBe(true);
        });

        it("When the entry is not in the storage, it should return false", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            // Act
            const isEntryExist = await entryProxy.existEntry(parentEquipmentId, entryToSave._uiId);

            // Assert
            expect(isEntryExist).toBe(false);
        });

        it("When the entry does not have _uiId valid, it should return false", async() => {
            // Arrange


            // Act
            const isEntryExist = await entryProxy.existEntry(parentEquipmentId, undefined);

            // Assert
            expect(isEntryExist).toBe(false);
        });
    });
});



