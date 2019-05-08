import Entity from './Entity';
import Equipment from './Equipment';
import {useUID} from 'react-uid';

import { EquipmentModel, UserModel, AgeAcquisitionType } from './Types';

export default class User extends Entity<UserModel> { 

    private equipments:Equipment[];

    constructor(user:UserModel) { 
        super(user);
        this.equipments = [];
    }

    setModel(user:UserModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.entity = user;
        });
    }

    addEquipment(equipment: EquipmentModel): Promise<void>{
        return new Promise<void>(resolve => {
            const newEquipment = new Equipment(equipment, this);
            this.equipments.push(newEquipment);
        });
    }

    removeEquipment(equipmentToDelete: EquipmentModel): Promise<void>{
        return new Promise<void>(resolve => {
            this.equipments = this.equipments.filter(equipment => equipment.getModel()._id !== equipmentToDelete._id);
        });
    }

    createDefaultEquipment(): EquipmentModel{
        return {
            _id: undefined,
            _uiId: useUID(),
            name: "",
            brand: "",
            model: "",
            age: 0,
            installation: new Date(),
            ageAcquisitionType: AgeAcquisitionType.manualEntry,
            ageUrl: ""
        }
    }
 }