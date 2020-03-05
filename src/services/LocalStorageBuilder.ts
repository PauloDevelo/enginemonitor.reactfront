/* eslint-disable  */

import log from 'loglevel';

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

import {convertUrlImageIntoDataUrl} from '../helpers/ImageHelper';

export type LocalStorageBuildingContext = {
  isRebuilding: boolean;
  totalAction: number;
  remainingAction: number;
}


export class LocalStorageBuilderException extends Error {}

export interface ILocalStorageBuilder {
    rebuild(): Promise<void>;

    registerLocalStorageBuilderListener(listener: (context: LocalStorageBuildingContext) => Promise<void>):void;
    unregisterLocalStorageBuilderListener(listener: (context: LocalStorageBuildingContext) => Promise<void>):void;
}

class LocalStorageBuilder implements ILocalStorageBuilder {
    private readonly localStorageRebuildingContext: LocalStorageBuildingContext = {
      isRebuilding: false,
      totalAction: 0,
      remainingAction: 0,
    };

    private listeners: ((context: LocalStorageBuildingContext) => Promise<void>)[] = [];

    registerLocalStorageBuilderListener(listener: (context: LocalStorageBuildingContext) => Promise<void>):void{
      this.listeners.push(listener);
    }

    unregisterLocalStorageBuilderListener(listenerToRemove: (context: LocalStorageBuildingContext) => Promise<void>):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    rebuild = async (): Promise<void> => {
      if (storageService.isUserStorageOpened() === false) {
        throw new LocalStorageBuilderException('storageNotOpenedYet');
      }

      if ((await onlineManager.isOnline()) === false) {
        throw new LocalStorageBuilderException('localStorageBuilderErrorOffline');
      }

      return this.rebuildLocalStorage();
    }

    private rebuildLocalStorage = async (): Promise<void> => {
      try {
        const storageVersion = await storageService.getStorageVersion();

        await storageService.getUserStorage().clear();

        await actionManager.writeActionsInStorage();
        await storageService.setStorageVersion(storageVersion);

        const assets = await assetProxy.fetchAssets();
        await Promise.all(assets.map((asset) => this.fetchAssetChildren(asset)));
      } catch (error) {
        log.error(error);
        throw new LocalStorageBuilderException('unexpectedError');
      }
    }

    private fetchAssetChildren = async (asset: AssetModel) => {
      await userProxy.getCredentials({ assetUiId: asset._uiId });
      await guestLinkProxy.getGuestLinks(asset._uiId);

      await this.fetchEntityImages(asset);

      const equipments = await equipmentProxy.fetchEquipments(asset._uiId);
      return Promise.all(equipments.map((equipment) => this.fetchEquipmentChildren(equipment)));
    }

    private fetchEquipmentChildren = async (equipment: EquipmentModel) => {
      await this.fetchEntityImages(equipment);

      const tasks = await taskProxy.fetchTasks({ equipmentId: equipment._uiId });
      const entries = await entryProxy.fetchAllEntries({ equipmentId: equipment._uiId });

      const promises = [Promise.all(tasks.map((task) => this.fetchEntityImages(task))), Promise.all(entries.map((entry) => this.fetchEntityImages(entry)))];
      return Promise.all(promises);
    }

    private fetchEntityImages = async (entity: EntityModel) => {
      const images = await imageProxy.fetchImages({ parentUiId: entity._uiId });
      return Promise.all(images.map((image) => this.fetchDataImage(image)));
    }

    private async fetchDataImage(image: ImageModel): Promise<void[]> {
      const storeImage = async (imageUrl: string) => {
        const image = await convertUrlImageIntoDataUrl(imageUrl);
        storageService.setItem(imageUrl, image);
      }

      const storeImagePromises = [storeImage(image.url), storeImage(image.thumbnailUrl)];
      return Promise.all(storeImagePromises);
    }
}

const localStorageBuilder = new LocalStorageBuilder();

export default localStorageBuilder as ILocalStorageBuilder;
