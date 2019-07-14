import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateEquipment } from '../helpers/EquipmentHelper'
import { EquipmentModel} from '../types/Types'

export interface IEquipmentProxy{
    fetchEquipments(forceToLookUpInStorage: boolean): Promise<EquipmentModel[]>;
    createOrSaveEquipment(equipmentToSave: EquipmentModel):Promise<EquipmentModel>;
    deleteEquipment(idEquipment: string): Promise<EquipmentModel>;

    existEquipment(equipmentId: string | undefined):Promise<boolean>;
}

class EquipmentProxy implements IEquipmentProxy{
    private baseUrl:string = process.env.REACT_APP_URL_BASE + "equipments/";

    ////////////////Equipment////////////////////////
    fetchEquipments = async(forceToLookUpInStorage: boolean = false): Promise<EquipmentModel[]> => {
        if (forceToLookUpInStorage){
            return await storageService.getArray<EquipmentModel>(this.baseUrl)
        }
        
        return await progressiveHttpProxy.getArrayOnlineFirst<EquipmentModel>(this.baseUrl, "equipments", updateEquipment);
    }
    
    createOrSaveEquipment = async(equipmentToSave: EquipmentModel):Promise<EquipmentModel> => {
        equipmentToSave = await progressiveHttpProxy.postAndUpdate<EquipmentModel>(this.baseUrl + equipmentToSave._uiId, "equipment", equipmentToSave, updateEquipment);           
        await storageService.updateArray(this.baseUrl, equipmentToSave);
        return equipmentToSave;
    }

    deleteEquipment = async (idEquipment: string): Promise<EquipmentModel> => {
        await progressiveHttpProxy.deleteAndUpdate<EquipmentModel>(this.baseUrl + idEquipment, "equipment", updateEquipment);
        return updateEquipment(await storageService.removeItemInArray<EquipmentModel>(this.baseUrl, idEquipment));
    }

    existEquipment = async (equipmentId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined){
            console.error("The function EquipmentProxy.existEquipment expects a non null and non undefined equipment id.")
            return false;
        }

        const allEquipments = await this.fetchEquipments(true);
        return allEquipments.findIndex(equipment => equipment._uiId === equipmentId) !== -1;
    }
}

const equipmentProxy:IEquipmentProxy = new EquipmentProxy();
export default equipmentProxy;
