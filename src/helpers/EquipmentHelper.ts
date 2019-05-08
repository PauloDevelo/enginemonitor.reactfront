import { EquipmentModel, AgeAcquisitionType } from "../types/Types";

export function createDefaultEquipment(uuid: string): EquipmentModel{
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