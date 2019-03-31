import { Equipment } from "../types/Types";

export function createDefaultEquipment(): Equipment{
	return {
		name: "",
		brand: "",
		model: "",
		age: 0,
		installation: new Date()
	}
}

export function updateEquipment(equipment: Equipment): Equipment{
    equipment.installation = new Date(equipment.installation);
    return equipment;
}