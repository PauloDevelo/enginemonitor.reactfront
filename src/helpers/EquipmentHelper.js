export function createDefaultEquipment(state){
	return {
		name: "",
		brand: "",
		model: "",
		age: "",
		installation: new Date()
	}
}

export function getCurrentEquipment(state){
	return state.equipments[state.currentEquipmentIndex];
}

export function updateEquipment(equipment){
    equipment.installation = new Date(equipment.installation);
    return equipment;
}