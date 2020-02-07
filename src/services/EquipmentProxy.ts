import * as log from 'loglevel';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import taskProxy from './TaskProxy';
import entryProxy from './EntryProxy';

import { updateEquipment } from '../helpers/EquipmentHelper';
// eslint-disable-next-line no-unused-vars
import { EquipmentModel } from '../types/Types';
import imageProxy from './ImageProxy';

export interface IEquipmentProxy{
    fetchEquipments(): Promise<EquipmentModel[]>;
    createOrSaveEquipment(equipmentToSave: EquipmentModel):Promise<EquipmentModel>;
    deleteEquipment(idEquipment: string): Promise<EquipmentModel>;

    getStoredEquipment():Promise<EquipmentModel[]>;

    existEquipment(equipmentId: string | undefined):Promise<boolean>;

    onAssetDeleted(idAsset: string): Promise<void>;
}

class EquipmentProxy implements IEquipmentProxy {
    private baseUrl:string = `${process.env.REACT_APP_URL_BASE}equipments/`;

    // //////////////Equipment////////////////////////
    fetchEquipments = async (forceToLookUpInStorage: boolean = false): Promise<EquipmentModel[]> => {
      if (forceToLookUpInStorage) {
        return storageService.getArray<EquipmentModel>(this.baseUrl);
      }

      return progressiveHttpProxy.getArrayOnlineFirst<EquipmentModel>(this.baseUrl, 'equipments', updateEquipment);
    }

    createOrSaveEquipment = async (equipmentToSave: EquipmentModel):Promise<EquipmentModel> => {
      const updatedEquipment = await progressiveHttpProxy.postAndUpdate<EquipmentModel>(this.baseUrl + equipmentToSave._uiId, 'equipment', equipmentToSave, updateEquipment);
      await storageService.updateArray(this.baseUrl, updatedEquipment);
      return updatedEquipment;
    }

    deleteEquipment = async (idEquipment: string): Promise<EquipmentModel> => {
      await progressiveHttpProxy.deleteAndUpdate<EquipmentModel>(this.baseUrl + idEquipment, 'equipment', updateEquipment);

      await entryProxy.onEquipmentDeleted(idEquipment);
      await taskProxy.onEquipmentDeleted(idEquipment);
      await imageProxy.onEntityDeleted(idEquipment);

      const deletedEquipment = await storageService.removeItemInArray<EquipmentModel>(this.baseUrl, idEquipment);
      return updateEquipment(deletedEquipment);
    }

    getStoredEquipment = async ():Promise<EquipmentModel[]> => this.fetchEquipments(true)

    existEquipment = async (equipmentId: string | undefined):Promise<boolean> => {
      if (equipmentId === undefined) {
        log.error('The function EquipmentProxy.existEquipment expects a non null and non undefined equipment id.');
        return false;
      }

      const allEquipments = await this.fetchEquipments(true);
      return allEquipments.findIndex((equipment) => equipment._uiId === equipmentId) !== -1;
    }

    onAssetDeleted = async (assetId: string): Promise<void> => {
      const equipments = await this.fetchEquipments(true);

      await equipments.reduce(async (previousPromise, equipment) => {
        await previousPromise;

        await entryProxy.onEquipmentDeleted(equipment._uiId);
        await taskProxy.onEquipmentDeleted(equipment._uiId);
        await imageProxy.onEntityDeleted(equipment._uiId);

        await storageService.removeItemInArray<EquipmentModel>(this.baseUrl, equipment._uiId);
      }, Promise.resolve());
    }
}

const equipmentProxy:IEquipmentProxy = new EquipmentProxy();
export default equipmentProxy;
