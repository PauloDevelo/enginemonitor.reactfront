export enum AgeAcquisitionType{
    time = 0,
    manualEntry=1,
    tracker=2
}

export interface EntityModel{
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
    equipmentUiId: string,
    taskUiId: string | undefined
}

export interface UserModel extends EntityModel {
    email: string,
    password: string,
    firstname: string,
    imageFolderSizeInByte: number,
    imageFolderSizeLimitInByte: number
}

export type AuthInfo = {
    email: string,
    password: string,
    remember: boolean
}

export interface ImageModel extends EntityModel {
    url: string,
    thumbnailUrl: string,
    parentUiId: string,
    title: string,
    description:string,
    sizeInByte:number
}