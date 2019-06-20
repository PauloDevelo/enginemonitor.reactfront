import { EquipmentModel, AgeAcquisitionType } from "../types/Types";
import uuidv1 from 'uuid/v1';

export function createDefaultEquipment(): EquipmentModel{
	const uuid = uuidv1();

	return {
		_id: undefined,
		_uiId: uuid,
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