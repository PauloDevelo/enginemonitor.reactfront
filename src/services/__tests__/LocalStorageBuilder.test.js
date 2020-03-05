import localStorageBuilder, { LocalStorageBuilderException } from '../LocalStorageBuilder';

import storageService from '../StorageService';
import onlineManager from '../OnlineManager';
import actionManager from '../ActionManager';

import userProxy from '../UserProxy';
import assetProxy from '../AssetProxy';
import equipmentProxy from '../EquipmentProxy';
import taskProxy from '../TaskProxy';
import entryProxy from '../EntryProxy';
import imageProxy from '../ImageProxy';
import guestLinkProxy from '../GuestLinkProxy';

jest.mock('../StorageService');
jest.mock('../OnlineManager');
jest.mock('../ActionManager');

jest.mock('../AssetProxy');
jest.mock('../EquipmentProxy');
jest.mock('../TaskProxy');
jest.mock('../EntryProxy');
jest.mock('../ImageProxy');
jest.mock('../UserProxy');
jest.mock('../GuestLinkProxy');

describe('Test LocalStorageBuilder', () => {
  beforeEach(() => {
    storageService.isUserStorageOpened.mockImplementation(() => true);
    storageService.getStorageVersion.mockImplementation(async () => Promise.resolve(123));
    storageService.setStorageVersion.mockImplementation(async () => {});

    storageService.getUserStorage.mockImplementation(() => ({ clear: jest.fn(async () => {}) }));

    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(true));

    actionManager.writeActionsInStorage.mockImplementation(async () => {});

    userProxy.getCredentials.mockImplementation(async () => ({}));
    assetProxy.fetchAssets.mockImplementation(async () => ([]));
    equipmentProxy.fetchEquipments.mockImplementation(async () => ([]));
    taskProxy.fetchTasks.mockImplementation(async () => ([]));
    entryProxy.fetchAllEntries.mockImplementation(async () => ([]));
    imageProxy.fetchImages.mockImplementation(async () => ([]));
    guestLinkProxy.getGuestLinks.mockImplementation(async () => ([]));
  });

  afterEach(() => {
    storageService.isUserStorageOpened.mockRestore();
    storageService.getStorageVersion.mockRestore();
    storageService.setStorageVersion.mockRestore();
    storageService.getUserStorage.mockRestore();

    onlineManager.isOnline.mockRestore();

    actionManager.writeActionsInStorage.mockRestore();

    userProxy.getCredentials.mockRestore();
    assetProxy.fetchAssets.mockRestore();
    equipmentProxy.fetchEquipments.mockRestore();
    taskProxy.fetchTasks.mockRestore();
    entryProxy.fetchAllEntries.mockRestore();
    imageProxy.fetchImages.mockRestore();
    guestLinkProxy.getGuestLinks.mockRestore();
  });

  it('Should throw a LocalStorageBuilderException because the user storage is not opened yet', async (done) => {
    // Arrange
    storageService.isUserStorageOpened.mockImplementation(() => false);

    try {
      // Act
      await localStorageBuilder.rebuild();
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(LocalStorageBuilderException);
      expect(error.message).toEqual('storageNotOpenedYet');
      done();
    }
  });

  it('Should throw a LocalStorageBuilderException because the app is offline', async (done) => {
    // Arrange
    onlineManager.isOnline.mockImplementation(async () => Promise.resolve(false));

    try {
      // Act
      await localStorageBuilder.rebuild();
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(LocalStorageBuilderException);
      expect(error.message).toEqual('localStorageBuilderErrorOffline');
      done();
    }
  });

  it('Should clear the storage, set the previous storage version and write again the list of action', async (done) => {
    // Arrange
    const storageVersion = 123;
    storageService.getStorageVersion.mockImplementation(async () => Promise.resolve(storageVersion));

    const clearFn = jest.fn(async () => {});
    storageService.getUserStorage.mockImplementation(() => ({ clear: clearFn }));

    // Act
    await localStorageBuilder.rebuild();

    // Assert
    expect(clearFn).toHaveBeenCalledTimes(1);

    expect(storageService.setStorageVersion).toHaveBeenCalledTimes(1);
    expect(storageService.setStorageVersion.mock.calls[0][0]).toEqual(storageVersion);

    expect(actionManager.writeActionsInStorage).toHaveBeenCalledTimes(1);

    done();
  });

  it('For all the assets, it should try to get all the equipments, images, credentials and guest links', async (done) => {
    // Arrange
    const asset1 = { _uiId: 'asset_01' };
    const asset2 = { _uiId: 'asset_02' };

    assetProxy.fetchAssets.mockImplementation(async () => ([asset1, asset2]));

    // Act
    await localStorageBuilder.rebuild();

    // Assert
    expect(equipmentProxy.fetchEquipments).toHaveBeenCalledTimes(2);
    expect(equipmentProxy.fetchEquipments.mock.calls[0][0]).toEqual(asset1._uiId);
    expect(equipmentProxy.fetchEquipments.mock.calls[1][0]).toEqual(asset2._uiId);

    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(2);
    expect(imageProxy.fetchImages.mock.calls[0][0]).toEqual({ parentUiId: asset1._uiId });
    expect(imageProxy.fetchImages.mock.calls[1][0]).toEqual({ parentUiId: asset2._uiId });

    expect(userProxy.getCredentials).toHaveBeenCalledTimes(2);
    expect(userProxy.getCredentials.mock.calls[0][0]).toEqual({ assetUiId: asset1._uiId });
    expect(userProxy.getCredentials.mock.calls[1][0]).toEqual({ assetUiId: asset2._uiId });

    expect(guestLinkProxy.getGuestLinks).toHaveBeenCalledTimes(2);
    expect(guestLinkProxy.getGuestLinks.mock.calls[0][0]).toEqual(asset1._uiId);
    expect(guestLinkProxy.getGuestLinks.mock.calls[1][0]).toEqual(asset2._uiId);
    done();
  });

  it('For all the equipments, it should try to get all tasks, all entries and images', async () => {
    // Arrange
    const asset1 = { _uiId: 'asset_01' };
    assetProxy.fetchAssets.mockImplementation(async () => ([asset1]));

    const equipment1 = { _uiId: 'equipment_01' };
    const equipment2 = { _uiId: 'equipment_02' };

    equipmentProxy.fetchEquipments.mockImplementation(async () => [equipment1, equipment2]);

    // Act
    await localStorageBuilder.rebuild();

    // Assert
    expect(taskProxy.fetchTasks).toHaveBeenCalledTimes(2);
    expect(taskProxy.fetchTasks.mock.calls[0][0]).toEqual({ equipmentId: equipment1._uiId });
    expect(taskProxy.fetchTasks.mock.calls[1][0]).toEqual({ equipmentId: equipment2._uiId });

    expect(entryProxy.fetchAllEntries).toHaveBeenCalledTimes(2);
    expect(entryProxy.fetchAllEntries.mock.calls[0][0]).toEqual({ equipmentId: equipment1._uiId });
    expect(entryProxy.fetchAllEntries.mock.calls[1][0]).toEqual({ equipmentId: equipment2._uiId });

    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(3);
    expect(imageProxy.fetchImages.mock.calls[0][0]).toEqual({ parentUiId: asset1._uiId });
    expect(imageProxy.fetchImages.mock.calls[1][0]).toEqual({ parentUiId: equipment1._uiId });
    expect(imageProxy.fetchImages.mock.calls[2][0]).toEqual({ parentUiId: equipment2._uiId });
  });

  it('For all the tasks, it should try to get all images', async () => {
    // Arrange
    const asset1 = { _uiId: 'asset_01' };
    assetProxy.fetchAssets.mockImplementation(async () => ([asset1]));

    const equipment1 = { _uiId: 'equipment_01' };
    equipmentProxy.fetchEquipments.mockImplementation(async () => [equipment1]);

    const task1 = { _uiId: 'task_01' };
    const task2 = { _uiId: 'task_02' };
    taskProxy.fetchTasks.mockImplementation(async () => [task1, task2]);

    // Act
    await localStorageBuilder.rebuild();

    // Assert
    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(4);
    expect(imageProxy.fetchImages.mock.calls[0][0]).toEqual({ parentUiId: asset1._uiId });
    expect(imageProxy.fetchImages.mock.calls[1][0]).toEqual({ parentUiId: equipment1._uiId });
    expect(imageProxy.fetchImages.mock.calls[2][0]).toEqual({ parentUiId: task1._uiId });
    expect(imageProxy.fetchImages.mock.calls[3][0]).toEqual({ parentUiId: task2._uiId });
  });

  it('For all the entries, it should try to get all images', async () => {
    // Arrange
    const asset1 = { _uiId: 'asset_01' };
    assetProxy.fetchAssets.mockImplementation(async () => ([asset1]));

    const equipment1 = { _uiId: 'equipment_01' };
    equipmentProxy.fetchEquipments.mockImplementation(async () => [equipment1]);

    const entry1 = { _uiId: 'entry_01' };
    const entry2 = { _uiId: 'entry_02' };
    entryProxy.fetchAllEntries.mockImplementation(async () => [entry1, entry2]);

    // Act
    await localStorageBuilder.rebuild();

    // Assert
    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(4);
    expect(imageProxy.fetchImages.mock.calls[0][0]).toEqual({ parentUiId: asset1._uiId });
    expect(imageProxy.fetchImages.mock.calls[1][0]).toEqual({ parentUiId: equipment1._uiId });
    expect(imageProxy.fetchImages.mock.calls[2][0]).toEqual({ parentUiId: entry1._uiId });
    expect(imageProxy.fetchImages.mock.calls[3][0]).toEqual({ parentUiId: entry2._uiId });
  });
});
