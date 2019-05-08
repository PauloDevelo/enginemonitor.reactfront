import {EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType} from '../types/Types'


export function createDefaultEntry(equipment:EquipmentModel, task: TaskModel | undefined, uuid: string): EntryModel{
	let defaultAge = -1;
	if(equipment.ageAcquisitionType !== AgeAcquisitionType.time){
		defaultAge = equipment.age;
	}

	return {
		_id: undefined,
		_uiId: uuid,
		name: task?task.name:"",
		date: new Date(),
		age: defaultAge,
		remarks: '',
		taskId: task?task._id:undefined
	}
}

export function updateEntry(entry: EntryModel): EntryModel {
    entry.date = new Date(entry.date);
    return entry;
}