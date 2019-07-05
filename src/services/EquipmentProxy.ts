import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateEquipment } from '../helpers/EquipmentHelper'
import { EquipmentModel} from '../types/Types'

export interface IEquipmentProxy{
    fetchEquipments(): Promise<EquipmentModel[]>;
    createOrSaveEquipment(equipmentToSave: EquipmentModel):Promise<EquipmentModel>;
    deleteEquipment(idEquipment: string): Promise<EquipmentModel>;

    existEquipment(equipmentId: string | undefined):Promise<boolean>;
}

class EquipmentProxy implements IEquipmentProxy{
    baseUrl = process.env.REACT_APP_URL_BASE;

    ////////////////Equipment////////////////////////
    fetchEquipments = async(): Promise<EquipmentModel[]> => {
        return await progressiveHttpProxy.getArrayOnlineFirst<EquipmentModel>(this.baseUrl + "equipments", "equipments", updateEquipment);
    }
    
    createOrSaveEquipment = async(equipmentToSave: EquipmentModel):Promise<EquipmentModel> => {
        equipmentToSave = await progressiveHttpProxy.postAndUpdate<EquipmentModel>(this.baseUrl + "equipments/" + equipmentToSave._uiId, "equipment", equipmentToSave, updateEquipment);           

        storageService.updateArray(this.baseUrl + "equipments", equipmentToSave);

        return equipmentToSave;
    }

    deleteEquipment = async (idEquipment: string): Promise<EquipmentModel> => {
        await progressiveHttpProxy.deleteAndUpdate<EquipmentModel>(this.baseUrl + "equipments/" + idEquipment, "equipments", updateEquipment);

        return storageService.removeItemInArray<EquipmentModel>(this.baseUrl + "equipments", idEquipment);
    }

    existEquipment = async (equipmentId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined){
            return false;
        }

        const allEquipments = await this.fetchEquipments();

        return allEquipments.findIndex(equipment => equipment._uiId === equipmentId) !== -1;
    }
}

const equipmentProxy:IEquipmentProxy = new EquipmentProxy();
export default equipmentProxy;
