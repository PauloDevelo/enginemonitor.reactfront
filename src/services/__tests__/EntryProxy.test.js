import httpProxy from '../HttpProxy';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import entryProxy from '../EntryProxy';
import actionManager from '../ActionManager';
import assetManager from '../AssetManager';
import imageProxy from '../ImageProxy';
import userProxy from '../UserProxy';

import { updateEntry } from '../../helpers/EntryHelper';

jest.mock('../HttpProxy');
jest.mock('../OnlineManager');
jest.mock('../ImageProxy');
jest.mock('../UserProxy');

describe('Test EntryProxy', () => {
  const parentEquipmentId = 'an_parent_equipment';
  const parentTaskId = 'a_parent_task_id';
  const urlFetchEntry = `${process.env.REACT_APP_API_URL_BASE}entries/asset_01/${parentEquipmentId}`;

  const entryToSave = {
    _uiId: 'an_entry_id',
    name: 'vidange',
    date: new Date(),
    age: 400,
    remarks: 'oil was clean',
    taskUiId: parentTaskId,
    equipmentUiId: parentEquipmentId,
  };

  function mockHttpProxy() {
    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.deleteReq.mockReset();
  }

  function initStorage() {
    const user = { email: 'test@gmail.com' };
    storageService.openUserStorage(user);
  }

  async function clearStorage() {
    await actionManager.clearActions();
    storageService.setItem(urlFetchEntry, undefined);
    storageService.closeUserStorage();
  }

  beforeEach(async () => {
    userProxy.getCredentials.mockImplementation(async () => ({ readonly: false }));
    mockHttpProxy();
    initStorage();

    await assetManager.setCurrentAsset({
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    });
  });

  afterEach(async () => {
    clearStorage();
    userProxy.getCredentials.mockRestore();
    imageProxy.onEntityDeleted.mockRestore();
    onlineManager.isOnlineAndSynced.mockRestore();
  });

  const createOrSaveEntryParams = [
    {
      isOnline: false, taskId: parentTaskId, expectedPostCounter: 0, expectedNumberOfEntries: 1, expectedNumberOfAction: 1,
    },
    {
      isOnline: true, taskId: parentTaskId, expectedPostCounter: 1, expectedNumberOfEntries: 1, expectedNumberOfAction: 0,
    },
    {
      isOnline: false, taskId: undefined, expectedPostCounter: 0, expectedNumberOfEntries: 1, expectedNumberOfAction: 1,
    },
    {
      isOnline: true, taskId: undefined, expectedPostCounter: 1, expectedNumberOfEntries: 1, expectedNumberOfAction: 0,
    },
  ];

  describe.each(createOrSaveEntryParams)('createOrSaveEntry', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      if (arg.expectedNumberOfEntries >= 1) {
        expect.assertions(5);
      } else {
        expect.assertions(4);
      }

      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

      // Act
      const entrySaved = await entryProxy.createOrSaveEntry(parentEquipmentId, arg.taskId, entryToSave);

      // Assert
      expect(httpProxy.post).toHaveBeenCalledTimes(arg.expectedPostCounter);
      expect(entrySaved).toEqual(entryToSave);

      const entries = await storageService.getItem(urlFetchEntry);
      expect(entries.length).toBe(arg.expectedNumberOfEntries);

      if (arg.expectedNumberOfEntries >= 1) {
        const storedEntry = updateEntry(entries[0]);
        expect(storedEntry).toEqual(entryToSave);
      }

      expect(actionManager.countAction()).toEqual(arg.expectedNumberOfAction);
    });
  });

  const deleteEntryParams = [
    {
      isOnline: false, expectedDeleteCounter: 0, taskId: parentTaskId, expectedNumberOfEntriesInStorage: 0, expectedNumberOfActions: 2,
    },
    {
      isOnline: true, expectedDeleteCounter: 1, taskId: parentTaskId, expectedNumberOfEntriesInStorage: 0, expectedNumberOfActions: 0,
    },
    {
      isOnline: false, expectedDeleteCounter: 0, taskId: undefined, expectedNumberOfEntriesInStorage: 0, expectedNumberOfActions: 2,
    },
    {
      isOnline: true, expectedDeleteCounter: 1, taskId: undefined, expectedNumberOfEntriesInStorage: 0, expectedNumberOfActions: 0,
    },
  ];
  describe.each(deleteEntryParams)('deleteEntries', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.deleteReq.mockImplementation((url) => Promise.resolve({ entry: { name: 'an entry name' } }));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await entryProxy.createOrSaveEntry(parentEquipmentId, arg.taskId, entryToSave);

      // Act
      const entryDeleted = await entryProxy.deleteEntry(parentEquipmentId, arg.taskId, entryToSave._uiId);

      // Assert
      expect(httpProxy.deleteReq).toHaveBeenCalledTimes(arg.expectedDeleteCounter);
      expect(entryDeleted).toEqual(entryToSave);

      const entries = await storageService.getItem(urlFetchEntry);
      expect(entries.length).toBe(arg.expectedNumberOfEntriesInStorage);

      expect(actionManager.countAction()).toBe(arg.expectedNumberOfActions);
    });
  });

  const existEntryParams = [
    {
      isOnline: true, equipmentId: parentEquipmentId, entryId: entryToSave._uiId, expectedIsExist: true,
    },
    {
      isOnline: true, equipmentId: parentEquipmentId, entryId: 'inexistingId', expectedIsExist: false,
    },
    {
      isOnline: true, equipmentId: parentEquipmentId, entryId: undefined, expectedIsExist: false,
    },
    {
      isOnline: true, equipmentId: undefined, entryId: entryToSave._uiId, expectedIsExist: false,
    },
    {
      isOnline: false, equipmentId: parentEquipmentId, entryId: entryToSave._uiId, expectedIsExist: true,
    },
    {
      isOnline: false, equipmentId: parentEquipmentId, entryId: 'inexistingId', expectedIsExist: false,
    },
    {
      isOnline: false, equipmentId: parentEquipmentId, entryId: undefined, expectedIsExist: false,
    },
    {
      isOnline: false, equipmentId: undefined, entryId: entryToSave._uiId, expectedIsExist: false,
    },
  ];
  describe.each(existEntryParams)('existEntry', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

      await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToSave);

      // Act
      const isEntryExist = await entryProxy.existEntry(arg.equipmentId, arg.entryId);

      // Assert
      expect(isEntryExist).toBe(arg.expectedIsExist);
    });
  });

  describe('onTaskDeleted', () => {
    const entryToSave1 = {
      _uiId: 'an_entry_id1',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: 'another_parent1',
      equipmentUiId: parentEquipmentId,
    };

    const entryToSave2 = {
      _uiId: 'an_entry_id2',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: 'another_parent2',
      equipmentUiId: parentEquipmentId,
    };

    const entryToSaveOrphan = {
      _uiId: 'an_entry_id3',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: undefined,
      equipmentUiId: parentEquipmentId,
    };

    it('should erase all the entries having this task for parent and the images attached to those entries', async (done) => {
      // Arrange
      const entryToDelete = entryToSave;
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));
      await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToDelete);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent1', entryToSave1);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent2', entryToSave2);
      await entryProxy.createOrSaveEntry(parentEquipmentId, undefined, entryToSaveOrphan);
      jest.spyOn(imageProxy, 'onEntityDeleted');

      // Act
      await entryProxy.onTaskDeleted(parentEquipmentId, parentTaskId);

      // Assert
      const entries = await entryProxy.fetchAllEntries({ equipmentId: parentEquipmentId });
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(entryToSave1);
      expect(entries).toContainEqual(entryToSave2);
      expect(entries).toContainEqual(entryToSaveOrphan);
      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(1);
      expect(imageProxy.onEntityDeleted.mock.calls[0][0]).toEqual(entryToDelete._uiId);
      done();
    });

    it('should erase all the entries in the memory having this task for parent and the images attached to those entries', async (done) => {
      // Arrange
      const entryToDelete = entryToSave;
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));
      await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToDelete);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent1', entryToSave1);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent2', entryToSave2);
      await entryProxy.createOrSaveEntry(parentEquipmentId, undefined, entryToSaveOrphan);
      jest.spyOn(imageProxy, 'onEntityDeleted');

      // Act
      await entryProxy.onTaskDeleted(parentEquipmentId, parentTaskId);

      // Assert
      const entries = await entryProxy.fetchAllEntries({ equipmentId: parentEquipmentId, forceToLookUpInStorage: true });
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(entryToSave1);
      expect(entries).toContainEqual(entryToSave2);
      expect(entries).toContainEqual(entryToSaveOrphan);
      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(1);
      expect(imageProxy.onEntityDeleted.mock.calls[0][0]).toEqual(entryToDelete._uiId);
      done();
    });
  });

  describe('onEquipmentDeleted', () => {
    const entryToDelete1 = {
      _uiId: 'an_entry_id1',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: 'another_parent1',
      equipmentUiId: parentEquipmentId,
    };

    const entryToDelete2 = {
      _uiId: 'an_entry_id2',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: 'another_parent2',
      equipmentUiId: parentEquipmentId,
    };

    const orphanEntryToDelete = {
      _uiId: 'an_entry_id3',
      name: 'vidange',
      date: new Date(),
      age: 400,
      remarks: 'oil was clean',
      taskUiId: undefined,
      equipmentUiId: parentEquipmentId,
    };

    it('should erase all the entries having this equipment for parent and the images attached to those entries', async (done) => {
      // Arrange
      const entryToDelete = entryToSave;
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));
      await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToDelete);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent1', entryToDelete1);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent2', entryToDelete2);
      await entryProxy.createOrSaveEntry(parentEquipmentId, undefined, orphanEntryToDelete);
      jest.spyOn(imageProxy, 'onEntityDeleted');

      // Act
      await entryProxy.onEquipmentDeleted(parentEquipmentId);

      // Assert
      const entries = await entryProxy.fetchAllEntries({ equipmentId: parentEquipmentId });
      expect(entries.length).toBe(0);
      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(4);

      const entryUiIdDeleted = imageProxy.onEntityDeleted.mock.calls.map((call) => call[0]);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      done();
    });

    it('should erase all the entries having this equipment for parent and the images attached to those entries', async (done) => {
      // Arrange
      const entryToDelete = entryToSave;
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));
      await entryProxy.createOrSaveEntry(parentEquipmentId, parentTaskId, entryToDelete);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent1', entryToDelete1);
      await entryProxy.createOrSaveEntry(parentEquipmentId, 'another_parent2', entryToDelete2);
      await entryProxy.createOrSaveEntry(parentEquipmentId, undefined, orphanEntryToDelete);
      jest.spyOn(imageProxy, 'onEntityDeleted');

      // Act
      await entryProxy.onEquipmentDeleted(parentEquipmentId);

      // Assert
      const entries = await entryProxy.fetchAllEntries({ equipmentId: parentEquipmentId, forceToLookUpInStorage: true });
      expect(entries.length).toBe(0);
      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(4);

      const entryUiIdDeleted = imageProxy.onEntityDeleted.mock.calls.map((call) => call[0]);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      expect(entryUiIdDeleted).toContainEqual(entryToDelete._uiId);
      done();
    });
  });
});
