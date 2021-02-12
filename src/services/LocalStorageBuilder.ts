/* eslint-disable max-classes-per-file */
import log from 'loglevel';

import { TaskWithProgress } from './TaskWithProgress';

import storageService from './StorageService';
import onlineManager from './OnlineManager';
import actionManager from './ActionManager';

import assetProxy from './AssetProxy';
import equipmentProxy from './EquipmentProxy';
import taskProxy from './TaskProxy';
import entryProxy from './EntryProxy';
import imageProxy from './ImageProxy';
import userProxy from './UserProxy';
import guestLinkProxy from './GuestLinkProxy';

import {
  // eslint-disable-next-line no-unused-vars
  AssetModel, ImageModel, EquipmentModel, EntityModel,
} from '../types/Types';

import { convertUrlImageIntoDataUrl } from '../helpers/ImageHelper';
import analytics from '../helpers/AnalyticsHelper';
import assetManager from './AssetManager';

export class LocalStorageBuilderException extends Error {}

class LocalStorageBuilder extends TaskWithProgress {
    run = async (isUserInteraction: boolean): Promise<void> => {
      if (storageService.isUserStorageOpened() === false) {
        throw new LocalStorageBuilderException('storageNotOpenedYet');
      }

      if ((await onlineManager.isOnline()) === false) {
        throw new LocalStorageBuilderException('actionErrorBecauseOffline');
      }

      analytics.rebuildStorage(isUserInteraction);
      return this.rebuildLocalStorage();
    }

    // eslint-disable-next-line class-methods-use-this
    cancel(): void{
    }

    private rebuildLocalStorage = async (): Promise<void> => {
      let assets: AssetModel[] = [];
      try {
        const storageVersion = await storageService.getStorageVersion();

        await storageService.getUserStorage().clear();

        await actionManager.writeActionsInStorage();
        await storageService.setStorageVersion(storageVersion);

        assets = await assetProxy.fetchAssets({ cancelTimeout: true });

        this.taskProgress.init(assets.length);
        await this.triggerTaskProgressChanged();

        await Promise.all(assets.map((asset) => this.fetchAssetChildren(asset)));
      } catch (error) {
        log.error(error);
        throw new LocalStorageBuilderException('unexpectedError');
      } finally {
        this.taskProgress.isRunning = false;
        await this.triggerTaskProgressChanged();

        const isOfflineMode = onlineManager.isOfflineModeActivated();

        onlineManager.setOfflineMode(true);
        assetManager.onAssetsChanged(assets);

        onlineManager.setOfflineMode(isOfflineMode);
      }
    }

    private fetchAssetChildren = async (asset: AssetModel) => {
      await userProxy.getCredentials({ assetUiId: asset._uiId });
      await guestLinkProxy.getGuestLinks(asset._uiId);

      const equipments = await equipmentProxy.fetchEquipments({ assetId: asset._uiId, cancelTimeout: true });

      if (equipments.length > 0) {
        this.taskProgress.addEntities(equipments.length);
        await this.triggerTaskProgressChanged();
      }

      await Promise.all(equipments.map((equipment) => this.fetchEquipmentChildren(equipment)));

      return this.fetchEntityImages(asset);
    }

    private fetchEquipmentChildren = async (equipment: EquipmentModel) => {
      const tasks = await taskProxy.fetchTasks({ equipmentId: equipment._uiId, cancelTimeout: true });
      if (tasks.length > 0) {
        this.taskProgress.addEntities(tasks.length);
        await this.triggerTaskProgressChanged();
      }

      const entries = await entryProxy.fetchAllEntries({ equipmentId: equipment._uiId, cancelTimeout: true });
      if (entries.length > 0) {
        this.taskProgress.addEntities(entries.length);
        await this.triggerTaskProgressChanged();
      }

      await Promise.all(tasks.map((task) => this.fetchEntityImages(task)));
      await Promise.all(entries.map((entry) => this.fetchEntityImages(entry)));

      return this.fetchEntityImages(equipment);
    }

    private fetchEntityImages = async (entity: EntityModel) => {
      const images = await imageProxy.fetchImages({ parentUiId: entity._uiId, cancelTimeout: true });

      this.taskProgress.decrement();
      this.taskProgress.addEntities(images.length);
      await this.triggerTaskProgressChanged();

      return Promise.all(images.map((image) => this.fetchDataImage(image)));
    }

    private async fetchDataImage(image: ImageModel): Promise<void[]> {
      let counter = 0;
      const storeImage = async (imageUrl: string) => {
        const imageDataUrl = await convertUrlImageIntoDataUrl(imageUrl);
        storageService.setItem(imageUrl, imageDataUrl);
        counter++;

        if (counter === 2) {
          this.taskProgress.decrement();
          await this.triggerTaskProgressChanged();
        }
      };

      const storeImagePromises = [storeImage(image.url), storeImage(image.thumbnailUrl)];
      return Promise.all(storeImagePromises);
    }
}

const localStorageBuilder = new LocalStorageBuilder();

export default localStorageBuilder as TaskWithProgress;
