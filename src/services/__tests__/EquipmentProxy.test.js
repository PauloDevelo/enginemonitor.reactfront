import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import equipmentProxy from '../EquipmentProxy';
import actionManager from '../ActionManager';

import { updateEquipment } from '../../helpers/EquipmentHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test EquipmentProxy', () => {
    const urlFetchEquipment = process.env.REACT_APP_URL_BASE + "equipments/";

    const equipmentToSave = { 
        _uiId: "an id generated by the front",
        name: "engine",
        brand: "Nanni",
        model: "N3.30",
        age: 2563,
        installation: new Date(2019, 6, 10),
        ageAcquisitionType: 1,
        ageUrl: ""
    }

    beforeEach(() => {
        httpProxy.setConfig.mockReset();
        httpProxy.post.mockReset();

        var user = { email: "test@gmail.com" };
        storageService.openUserStorage(user);
    });

    afterEach(async() => {
        await actionManager.clearActions();
        storageService.setItem(urlFetchEquipment, undefined);
        storageService.closeUserStorage();
    });

    describe('createOrSaveEquipment', () => {
        it("When offline, we should save the post query into history and save the new equipment into the storage", async () => {
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
            const equipmentSaved = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

            // Assert
            expect(postCounter).toBe(0);
            expect(equipmentSaved).toEqual(equipmentToSave);

            const equipments = await storageService.getItem(urlFetchEquipment);
            expect(equipments.length).toBe(1);

            const storedEquipment = updateEquipment(equipments[0]);
            expect(storedEquipment).toEqual(equipmentToSave);

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
            const equipmentSaved = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

            // Assert
            expect(postCounter).toBe(1);
            expect(equipmentSaved).toEqual(equipmentToSave);

            const equipments = await storageService.getItem(urlFetchEquipment);
            expect(equipments.length).toBe(1);

            const storedEquipment = updateEquipment(equipments[0]);
            expect(storedEquipment).toEqual(equipmentToSave);

            expect(await actionManager.countAction()).toBe(0);
        });
    });

    describe('deleteEquipment', () => {
        it("When offline, the deletion should not send a http delete query but add an action in the action manager, and remove the equipment in the storage. ", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(false);
            });

            let postCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                postCounter++;
                return Promise.resolve({ equipment: savedEquipment });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            const savedEquipment = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

            // Act
            const equipmentDeleted = await equipmentProxy.deleteEquipment(equipmentToSave._uiId);

            // Assert
            expect(postCounter).toBe(0);
            expect(equipmentDeleted).toEqual(equipmentToSave);

            const equipments = await storageService.getItem(urlFetchEquipment);
            expect(equipments.length).toBe(0);

            expect(await actionManager.countAction()).toBe(2);
        });

        it("When online, the deletion should send a http delete query, remove the equipment in the storage and add none action in the action manager. ", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            let deleteReqCounter = 0;
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteReqCounter++;
                return Promise.resolve({ equipment: { brand: '....'} });
            });

            httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
            await equipmentProxy.createOrSaveEquipment(equipmentToSave);

            // Act
            const equipmentDeleted = await equipmentProxy.deleteEquipment(equipmentToSave._uiId);

            // Assert
            expect(deleteReqCounter).toBe(1);
            expect(equipmentDeleted).toEqual(equipmentToSave);

            const equipments = await storageService.getItem(urlFetchEquipment);
            expect(equipments.length).toBe(0);

            expect(await actionManager.countAction()).toBe(0);
        });
    });

    describe('existEquipment', () => {
        it("When the equipment is in the storage, it should return true", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            await equipmentProxy.createOrSaveEquipment(equipmentToSave);

            // Act
            const isEquipmentExist = await equipmentProxy.existEquipment(equipmentToSave._uiId);

            // Assert
            expect(isEquipmentExist).toBe(true);
        });

        it("When the equipment is in the storage, it should return true", async () => {
            // Arrange
            syncService.isOnline.mockImplementation(() => {
                return Promise.resolve(true);
            });

            httpProxy.post.mockImplementation((url, data) => {
                return Promise.resolve(data);
            });
            
            // Act
            const isEquipmentExist = await equipmentProxy.existEquipment(equipmentToSave._uiId);

            // Assert
            expect(isEquipmentExist).toBe(false);
        });

        it("When the equipment does not have _uiId valid, it should return false", async() => {
            // Arrange


            // Act
            const isEquipmentExist = await equipmentProxy.existEquipment(undefined);

            // Assert
            expect(isEquipmentExist).toBe(false);
        });
    });
});



