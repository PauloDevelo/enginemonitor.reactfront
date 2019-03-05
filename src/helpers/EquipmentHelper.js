export function createDefaultEquipment(state){
	return {
		name: "",
		brand: "",
		model: "",
		age: "",
		installation: new Date()
	}
}

export function updateEquipment(equipment){
    equipment.installation = new Date(equipment.installation);
    return equipment;
}