import * as log from 'loglevel';

const storageVersionKey = 'storageVersion';

export interface IStorageUpdaterService{
  onUserStorageOpened(): Promise<void>;
}

class StorageUpdaterService implements IStorageUpdaterService {
  onUserStorageOpened = async (): Promise<void> => {
    const { default: storageService } = await import('./StorageService');
    const { default: equipmentProxy } = await import('./EquipmentProxy');
    const { default: entryProxy } = await import('./EntryProxy');

    let currentStorageVersion = 0;
    if (await storageService.existItem(storageVersionKey)) {
      currentStorageVersion = await storageService.getItem<number>(storageVersionKey);
    }

    log.info(`The storage version is  ${currentStorageVersion}`);

    if (currentStorageVersion < 1) {
      log.info('Update the storage to the release 1: Add the ack option in the entries');

      const equipments = await equipmentProxy.getStoredEquipment();
      const updateEntryPromises = equipments.map(async (equipment) => {
        try {
          const entries = await entryProxy.fetchAllEntries({ equipmentId: equipment._uiId, forceToLookUpInStorage: true });
          const updatedEntries = entries.map((entry) => ({ ack: true, ...entry }));
          await storageService.setItem(entryProxy.getBaseEntryUrl(equipment._uiId), updatedEntries);
          log.info(`The entries for the equipment ${equipment._uiId} are updated`);
        } catch (error) {
          log.error(error.message);
        }
      });

      await Promise.all(updateEntryPromises);

      currentStorageVersion = await storageService.setItem<number>(storageVersionKey, 1);
      log.info(`Storage updated to the release ${currentStorageVersion}`);
    }

    log.info(`The storage is up-to-dated with the version ${currentStorageVersion}`);
  }
}

const storageUpdaterService: IStorageUpdaterService = new StorageUpdaterService();
export default storageUpdaterService;
