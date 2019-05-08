import {EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType} from '../types/Types'
import {useUID} from 'react-uid';

export function createDefaultEntry(equipment?:EquipmentModel, task?: TaskModel): EntryModel{
	let defaultAge = -1;
	if(equipment && equipment.ageAcquisitionType !== AgeAcquisitionType.time){
		defaultAge = equipment.age;
	}

	return {
		_id: undefined,
		_uiId: useUID(),
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