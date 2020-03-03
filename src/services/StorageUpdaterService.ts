import * as log from 'loglevel';

// eslint-disable-next-line no-unused-vars
import { IStorageService } from './StorageService';

export interface IStorageUpdaterService{
  onUserStorageOpened(): Promise<void>;
}

class StorageUpdaterService implements IStorageUpdaterService {
  onUserStorageOpened = async (): Promise<void> => {
    if (process.env.NODE_ENV === 'test') {
      log.info('We do not perform any storage update in test mode.');
      return;
    }

    try {
      const { default: storageService } = await import('./StorageService');

      let currentStorageVersion = await storageService.getStorageVersion();
      log.info(`The storage version is  ${currentStorageVersion}`);

      if (currentStorageVersion < 1) {
        await this.upgradeStorageToRelease1(storageService);
      }

      if (currentStorageVersion < 2) {
        await this.upgradeStorageToRelease2(storageService);
      }

      currentStorageVersion = await storageService.getStorageVersion();
      log.info(`The storage is up-to-dated with the version ${currentStorageVersion}`);
    } catch (error) {
      log.error(`An error occurred during the upgrade of the storage: ${error.message}`);
      log.error(error);

      throw error;
    }
  }

  private upgradeStorageToRelease1 = async (storageService: IStorageService) => {
    log.info('Update the storage to the release 1: Add the ack option in the entries');

    const { default: equipmentProxy } = await import('./EquipmentProxy');
    const { default: entryProxy } = await import('./EntryProxy');

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

    const newCurrentVersion = await storageService.setStorageVersion(1);
    log.info(`Storage updated to the release ${newCurrentVersion}`);
  }

  private upgradeStorageToRelease2 = async (storageService: IStorageService) => {
    log.info('Update the storage to the release 2: clear the storage since the url have been changed');

    await storageService.getUserStorage().clear();

    const newStorageVersion = await storageService.setStorageVersion(2);
    log.info(`Storage updated to the release ${newStorageVersion}`);
  }
}

const storageUpdaterService: IStorageUpdaterService = new StorageUpdaterService();
export default storageUpdaterService;
