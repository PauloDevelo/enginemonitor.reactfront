/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */

export enum AgeAcquisitionType{
  time = 0,
  manualEntry=1,
  tracker=2
}

export type TaskTodo = {
    dueDate: Date,
    onlyDate: boolean,
    level: TaskLevel,
    usageInHourLeft: number | undefined
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

export enum TaskLevel{
done=1,
soon=2,
todo = 3,
}

export interface TaskModel extends EntityModel {
    periodInMonth: number,
    description: string,
    nextDueDate: Date,
    usagePeriodInHour: number | undefined,
    usageInHourLeft: number | undefined,
    level: TaskLevel
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
