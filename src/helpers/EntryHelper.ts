import {Equipment, Task, Entry, AgeAcquisitionType} from '../types/Types'

export function createDefaultEntry(equipment?:Equipment, task?: Task): Entry{
	let defaultAge = -1;
	if(equipment && equipment.ageAcquisitionType !== AgeAcquisitionType.time){
		defaultAge = equipment.age;
	}

	return {
		_id: undefined,
		name: task?task.name:"",
		date: new Date(),
		age: defaultAge,
		remarks: '',
	}
}

export function updateEntry(entry: Entry): Entry {
    entry.date = new Date(entry.date);
    return entry;
}