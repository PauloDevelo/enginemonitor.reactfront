import Equipment from './Equipment'
import Entry from './Entry'
import { TaskModel, EntryModel, AgeAcquisitionType } from './Types';
import Entity from './Entity';

import uuidv1 from 'uuid/v1';

export type TaskTodo = {
    dueDate: Date,
    onlyDate: boolean,
    level: number,
    usageInHourLeft: number | undefined
}

export default class Task extends Entity<TaskModel> { 
    private parent: Equipment;
    private entries:Entry[];

    constructor(task:TaskModel, parent: Equipment) { 
        super(task);
        this.parent = parent;
        this.entries = [];
    }

    getParent():Equipment {
        return this.parent;
    }

    setModel(task:TaskModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.entity = task;
        });
    }

    addEntry(entry: EntryModel): Promise<void>{
        return new Promise<void>(resolve => {
            const newEntry = new Entry(entry, this);
            this.entries.push(newEntry);
        });
    }

    removeEntry(entryToDelete: EntryModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.entries = this.entries.filter(entry => entry.getModel()._id !== entryToDelete._id);
        });
    }

    createDefaultEntry(): EntryModel{
        const uuid = uuidv1();

        let defaultAge = -1;
        
        if(this.parent.getModel().ageAcquisitionType !== AgeAcquisitionType.time){
            defaultAge = this.parent.getModel().age;
        }
    
        return {
            _uiId: uuid,
            _id: undefined,
            name: this.getModel().name,
            date: new Date(),
            age: defaultAge,
            remarks: '',
            taskId: this.getModel()._id
        }
    }

    getBadgeText():string{

        if(this.getModel().level === 1){
            return 'Done'
        }
        else if(this.getModel().level === 2){
            return 'Soon'
        }
        else{
            return 'ToDo'
        }
    }
    
    getContext(): string{
        if(this.getModel().level === 1){
            return "success";
        }
        else if(this.getModel().level === 2){
            return "warning";
        }
        else if(this.getModel().level === 3){
            return "danger";
        }
        else{
            return "primary";
        }
    }
    
    getColor(): string{
        if(this.getModel().level === 1){
            return "#C3E5CA";
        }
        else if(this.getModel().level === 2){
            return "#FFEEBA";
        }
        else if(this.getModel().level === 3){
            return "#F5C6CC";
        }
        else{
            return "white";
        }
    }
 }