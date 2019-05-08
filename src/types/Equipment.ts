import Task from './Task';
import Entity from './Entity';
import User from './User';
import Entry from './Entry';
import { EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType } from './Types';
import {useUID} from 'react-uid';

export default class Equipment extends Entity<EquipmentModel> { 

    private owner: User;
    private maintenanceTasks: Task[] = [];
    private orphanEntries: Entry[] = [];

    constructor(equipment:EquipmentModel, owner: User) { 
        super(equipment);
        this.owner = owner;
    }

    setModel(equipment:EquipmentModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.entity = equipment;
        });
    }

    addTask(task: TaskModel): Promise<void>{
        return new Promise<void>(resolve => {
            const newTask = new Task(task, this);
            this.maintenanceTasks.push(newTask);
        });
    }

    removeTask(taskToDelete: TaskModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.maintenanceTasks = this.maintenanceTasks.filter(task => task.getModel()._id !== taskToDelete._id);
        });
    }

    addOrphanEntry = async (entry: EntryModel) => {
        const orphanEntry = new Entry(entry, this);
        this.orphanEntries.push(orphanEntry);
    }

    removeOrphanEntry = async (entry: EntryModel) => {
        this.orphanEntries = this.orphanEntries.filter(orphanEntry => orphanEntry.getModel()._id !== entry._id);
    }

    createDefaultOrphanEntry(): EntryModel{
        let defaultAge = -1;
        if(this.getModel().ageAcquisitionType !== AgeAcquisitionType.time){
            defaultAge = this.getModel().age;
        }
    
        return {
            _id: undefined,
            _uiId: useUID(),
            name: "",
            date: new Date(),
            age: defaultAge,
            remarks: '',
            taskId: undefined
        }
    }

    createDefaultTask(): TaskModel{
        return {
            _id: undefined,
            _uiId: useUID(),
            name: '',
            usagePeriodInHour: this.getModel().ageAcquisitionType !== AgeAcquisitionType.time ? 100 : -1,
            periodInMonth: 12,
            description: '',
            nextDueDate: new Date(),
            level: 0,
            usageInHourLeft: undefined,
        }
    }
 }