import { Equipment, AgeAcquisitionType } from "../types/Types";

export function createDefaultEquipment(): Equipment{
	return {
		_id: undefined,
		name: "",
		brand: "",
		model: "",
		age: 0,
		installation: new Date(),
		ageAcquisitionType: AgeAcquisitionType.manualEntry,
		ageUrl: ""
	}
}

export function updateEquipment(equipment: Equipment): Equipment{
    equipment.installation = new Date(equipment.installation);
    return equipment;
}