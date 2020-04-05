import * as log from 'loglevel';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import taskProxy from './TaskProxy';
import entryProxy from './EntryProxy';

import { updateEquipment } from '../helpers/EquipmentHelper';
// eslint-disable-next-line no-unused-vars
import { EquipmentModel } from '../types/Types';
import imageProxy from './ImageProxy';

import assetManager from './AssetManager';
import HttpError from '../http/HttpError';

export interface FetchEquipmentProp{
  assetId?: string,
  cancelTimeout?: boolean,
  forceToLookUpInStorage?: boolean
}

export interface IEquipmentProxy{
    fetchEquipments(props?: FetchEquipmentProp): Promise<EquipmentModel[]>;
    createOrSaveEquipment(equipmentToSave: EquipmentModel):Promise<EquipmentModel>;
    deleteEquipment(idEquipment: string): Promise<EquipmentModel>;

    getStoredEquipment():Promise<EquipmentModel[]>;

    existEquipment(equipmentId: string | undefined):Promise<boolean>;

    onAssetDeleted(idAsset: string): Promise<void>;
}

class EquipmentProxy implements IEquipmentProxy {
    private getBaseUrl = (assetId: string | undefined) => `${process.env.REACT_APP_API_URL_BASE}equipments/${assetId}/`

    // //////////////Equipment////////////////////////
    fetchEquipments = async ({ assetId, forceToLookUpInStorage, cancelTimeout }: FetchEquipmentProp = { assetId: undefined, forceToLookUpInStorage: false, cancelTimeout: false }): Promise<EquipmentModel[]> => {
      const assetUiId = assetId === undefined ? assetManager.getCurrentAsset()?._uiId : assetId;
      if (forceToLookUpInStorage) {
        return progressiveHttpProxy.getArrayFromStorage<EquipmentModel>({ url: this.getBaseUrl(assetUiId), init: updateEquipment });
      }

      return progressiveHttpProxy.getArrayOnlineFirst<EquipmentModel>({
        url: this.getBaseUrl(assetUiId), keyName: 'equipments', init: updateEquipment, cancelTimeout,
      });
    }

    createOrSaveEquipment = async (equipmentToSave: EquipmentModel):Promise<EquipmentModel> => {
      if (await this.existEquipment(equipmentToSave._uiId) === false) {
        const equipments = await this.getStoredEquipment();
        if (equipments.findIndex((equipment) => equipment.name === equipmentToSave.name) !== -1) {
          throw new HttpError({ name: 'alreadyexisting' });
        }
      }

      const assetId = assetManager.getCurrentAsset()?._uiId;
      const postUrl: string = `${this.getBaseUrl(assetId)}${equipmentToSave._uiId}`;
      const updatedEquipment = await progressiveHttpProxy.postAndUpdate<EquipmentModel>(postUrl, 'equipment', equipmentToSave, updateEquipment);

      await storageService.updateArray(this.getBaseUrl(assetId), updatedEquipment);
      return updatedEquipment;
    }

    deleteEquipment = async (idEquipment: string): Promise<EquipmentModel> => {
      const assetId = assetManager.getCurrentAsset()?._uiId;
      const deleteUrl = `${this.getBaseUrl(assetId)}${idEquipment}`;

      await progressiveHttpProxy.delete<EquipmentModel>(deleteUrl);

      await entryProxy.onEquipmentDeleted(idEquipment);
      await taskProxy.onEquipmentDeleted(idEquipment);
      await imageProxy.onEntityDeleted(idEquipment);

      const deletedEquipment = await storageService.removeItemInArray<EquipmentModel>(this.getBaseUrl(assetId), idEquipment);
      return updateEquipment(deletedEquipment);
    }

    getStoredEquipment = async ():Promise<EquipmentModel[]> => this.fetchEquipments({ assetId: assetManager.getCurrentAsset()?._uiId, forceToLookUpInStorage: true })

    existEquipment = async (equipmentId: string | undefined):Promise<boolean> => {
      if (equipmentId === undefined) {
        log.error('The function EquipmentProxy.existEquipment expects a non null and non undefined equipment id.');
        return false;
      }

      const allEquipments = await this.getStoredEquipment();
      return allEquipments.findIndex((equipment) => equipment._uiId === equipmentId) !== -1;
    }

    onAssetDeleted = async (assetId: string): Promise<void> => {
      const equipments = await this.fetchEquipments({ assetId, forceToLookUpInStorage: true });

      await equipments.reduce(async (previousPromise, equipment) => {
        await previousPromise;

        await entryProxy.onEquipmentDeleted(equipment._uiId);
        await taskProxy.onEquipmentDeleted(equipment._uiId);
        await imageProxy.onEntityDeleted(equipment._uiId);

        await storageService.removeItemInArray<EquipmentModel>(this.getBaseUrl(assetId), equipment._uiId);
      }, Promise.resolve());
    }
}

const equipmentProxy:IEquipmentProxy = new EquipmentProxy();
export default equipmentProxy;
