import { EquipmentModel, AgeAcquisitionType } from "../types/Types";
import {useUID} from 'react-uid';

export function createDefaultEquipment(): EquipmentModel{
	return {
		_id: undefined,
		_uiId: useUID(),
		name: "",
		brand: "",
		model: "",
		age: 0,
		installation: new Date(),
		ageAcquisitionType: AgeAcquisitionType.manualEntry,
		ageUrl: ""
	}
}

export function updateEquipment(equipment: EquipmentModel): EquipmentModel{
    equipment.installation = new Date(equipment.installation);
    return equipment;
}