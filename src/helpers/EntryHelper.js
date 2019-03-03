export function createDefaultEntry(equipment, task){
	return {
		name: task?task.name:"",
		date: new Date(),
		age: equipment?equipment.age:0,
		remarks: '',
	}
}

export function updateEntry(entry) {
    entry.date = new Date(entry.date);
    return entry;
}