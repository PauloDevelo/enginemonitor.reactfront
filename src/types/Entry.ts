import Task from './Task';
import Equipment from './Equipment';
import Entity from './Entity';
import { EntryModel } from './Types';
import EquipmentMonitorService from '../services/EquipmentMonitorServiceProxy'

export default class Entry extends Entity<EntryModel> { 
    private parent: Task | Equipment;

    constructor(entry:EntryModel, parent: Task | Equipment) { 
        super(entry);
        this.parent = parent;
    }

    setModel = async (entry:EntryModel) => {
        const equipmentId = this.parent instanceof Task ? this.parent.getParent().getModel()._id : this.parent.getModel()._id;
        const taskId = this.parent instanceof Task ? this.parent.getModel()._id : undefined;
        
        try{
            entry = await EquipmentMonitorService.createOrSaveEntry(equipmentId!, taskId, this.entity);
        }
        catch{

        }

        this.entity = entry;
        localStorage.setItem(this.entity._uiId, JSON.stringify(this.entity));
    }
 }