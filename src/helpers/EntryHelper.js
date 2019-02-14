import { getCurrentTask } from './TaskHelper'
import { getCurrentEquipment } from './EquipmentHelper'

export function createDefaultEntry(state){
	return {
		name: getCurrentTask(state).name,
		date: new Date(),
		age: getCurrentEquipment(state).age,
		remarks: '',
	}
}

export function updateEntry(entry) {
    entry.date = new Date(entry.date);
    return entry;
}