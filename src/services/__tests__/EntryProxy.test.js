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
        {isOnline: true, taskId: parentTaskId, expectedPostCounter: 1, expectedNumberOfEntries: 1, expectedNumberOfAction: 0},
        {isOnline: false, taskId: undefined, expectedPostCounter: 0, expectedNumberOfEntries: 1, expectedNumberOfAction: 1},
        {isOnline: true, taskId: undefined, expectedPostCounter: 1, expectedNumberOfEntries: 1, expectedNumberOfAction: 0}
    ];

    describe.each(createOrSaveEntryParams)('createOrSaveEntry', (arg) => {
        it("when " + JSON.stringify(arg), async() => {
            // Arrange
            if(arg.expectedNumberOfEntries >= 1){
                expect.assertions(5);
            }
            else{
                expect.assertions(4);
            }
            
            syncService.isOnlineAndSynced.mockImplementation(() => {
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

    const deleteEntryParams = [
        {isOnline: false, expectedDeleteCounter: 0, taskId: parentTaskId, expectedNumberOfEntriesInStorage:0, expectedNumberOfActions:2},
        {isOnline: true, expectedDeleteCounter: 1, taskId: parentTaskId, expectedNumberOfEntriesInStorage:0, expectedNumberOfActions:0},
        {isOnline: false, expectedDeleteCounter: 0, taskId: undefined, expectedNumberOfEntriesInStorage:0, expectedNumberOfActions:2},
        {isOnline: true, expectedDeleteCounter: 1, taskId: undefined, expectedNumberOfEntriesInStorage:0, expectedNumberOfActions:0}
    ];
    describe.each(deleteEntryParams)('deleteEntries', (arg) =>{
        it("when " + JSON.stringify(arg), async() => {
            // Arrange
            syncService.isOnlineAndSynced.mockImplementation(() => {
                return Promise.resolve(arg.isOnline);
            });

            let deleteCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteCounter++;
                return Promise.resolve({ entry: { name: "an entry name" } });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            await entryProxy.createOrSaveEntry(parentEquipmentId, arg.taskId, entryToSave);

            // Act
            const entryDeleted = await entryProxy.deleteEntry(parentEquipmentId, arg.taskId, entryToSave._uiId);

            // Assert
            expect(deleteCounter).toBe(arg.expectedDeleteCounter);
            expect(entryDeleted).toEqual(entryToSave);

            const entries = await storageService.getItem(urlFetchEntry);
            expect(entries.length).toBe(arg.expectedNumberOfEntriesInStorage);

            expect(await actionManager.countAction()).toBe(arg.expectedNumberOfActions);
        });
    });

    const existEntryParams = [
        {isOnline:true, equipmentId:parentEquipmentId, entryId: entryToSave._uiId, expectedIsExist: true},
        {isOnline:true, equipmentId:parentEquipmentId, entryId: "inexistingId", expectedIsExist: false},
        {isOnline:true, equipmentId:parentEquipmentId, entryId: undefined, expectedIsExist: false},
        {isOnline:true, equipmentId:undefined, entryId: entryToSave._uiId, expectedIsExist: false},
        {isOnline:false, equipmentId:parentEquipmentId, entryId: entryToSave._uiId, expectedIsExist: true},
        {isOnline:false, equipmentId:parentEquipmentId, entryId: "inexistingId", expectedIsExist: false},
        {isOnline:false, equipmentId:parentEquipmentId, entryId: undefined, expectedIsExist: false},
        {isOnline:false, equipmentId:undefined, entryId: entryToSave._uiId, expectedIsExist: false},
    ];
    describe.each(existEntryParams)("existEntry", (arg)=>{
        it("when " + JSON.stringify(arg), async() =>{
             // Arrange
             syncService.isOnlineAndSynced.mockImplementation(() => {
                return Promise.resolve(arg.isOnline);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToSave);

            // Act
            const isEntryExist = await entryProxy.existEntry(arg.equipmentId, arg.entryId);

            // Assert
            expect(isEntryExist).toBe(arg.expectedIsExist);
        });
    });
});