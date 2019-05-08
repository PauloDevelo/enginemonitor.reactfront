export enum AgeAcquisitionType{
    time = 0,
    manualEntry=1,
    tracker=2
}

export interface EntityModel{
    _id: string | undefined,
    _uiId:string,
    name: string
}

export interface EquipmentModel extends EntityModel {
    brand: string,
    model: string,
    age: number,
    installation: Date,
    ageAcquisitionType: AgeAcquisitionType,
    ageUrl: string
}

export interface TaskModel extends EntityModel {
    periodInMonth: number,
    description: string,
    nextDueDate: Date,
    usagePeriodInHour: number | undefined,
    usageInHourLeft: number | undefined,
    level: number
}

export interface EntryModel extends EntityModel {
    date: Date,
    age: number,
    remarks: string,
    taskId: string | undefined
}

export interface UserModel extends EntityModel {
    email: string,
    password: string,
    firstname: string
}

export type AuthInfo = {
    email: string,
    password: string,
    remember: boolean
}