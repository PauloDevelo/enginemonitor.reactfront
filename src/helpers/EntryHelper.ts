import {Equipment, Task, Entry} from '../types/Types'

export function createDefaultEntry(equipment?:Equipment, task?: Task): Entry{
	return {
		name: task?task.name:"",
		date: new Date(),
		age: equipment?equipment.age:0,
		remarks: '',
	}
}

export function updateEntry(entry: Entry): Entry {
    entry.date = new Date(entry.date);
    return entry;
}