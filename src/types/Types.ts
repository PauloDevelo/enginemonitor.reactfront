/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */

export function extract<T>(properties: Record<keyof T, boolean>) {
  // eslint-disable-next-line func-names
  return function<TActual extends T> (value: TActual) {
    const result = {} as T;
    // eslint-disable-next-line no-restricted-syntax
    for (const property of Object.keys(properties) as Array<keyof T>) {
      if (properties[property] === true) {
        result[property] = value[property];
      }
    }
    return result;
  };
}

export enum AgeAcquisitionType{
  time = 0,
  manualEntry=1,
  tracker=2
}

export enum TaskLevel{
  done=1,
  soon=2,
  todo = 3,
}

export type TaskTodo = {
  dueDate: Date,
  onlyDate: boolean,
  level: TaskLevel,
  usageInHourLeft: number | undefined
}

export interface UserCredentials{
  readonly: boolean
}

export interface EntityModel{
  _uiId:string,
  name: string,
}

export interface GuestLinkModel extends EntityModel {
  niceKey: string
}

export interface EquipmentModel extends EntityModel {
  brand: string,
  model: string,
  age: number,
  installation: Date,
  ageAcquisitionType: AgeAcquisitionType,
  ageUrl: string
}

export const extractEquipmentModel = extract<EquipmentModel>({
  _uiId: true,
  name: true,
  brand: true,
  model: true,
  age: true,
  installation: true,
  ageAcquisitionType: true,
  ageUrl: true,
});

export interface TaskModel extends EntityModel {
  periodInMonth: number,
  description: string,
  nextDueDate: Date,
  usagePeriodInHour: number | undefined,
  usageInHourLeft: number | undefined,
  level: TaskLevel
}

export const extractTaskModel = extract<TaskModel>({
  _uiId: true,
  name: true,
  periodInMonth: true,
  description: true,
  nextDueDate: true,
  usagePeriodInHour: true,
  usageInHourLeft: true,
  level: true,
});

export interface EntryModel extends EntityModel {
  date: Date,
  age: number,
  remarks: string,
  equipmentUiId: string,
  taskUiId: string | undefined,
  ack: boolean
}

export const extractEntryModel = extract<EntryModel>({
  _uiId: true,
  name: true,
  date: true,
  age: true,
  remarks: true,
  equipmentUiId: true,
  taskUiId: true,
  ack: true,
});

export interface AssetModel extends EntityModel {
  brand: string;
  manufactureDate: Date;
  modelBrand: string;
}

export const extractAssetModel = extract<AssetModel>({
  _uiId: true,
  name: true,
  brand: true,
  manufactureDate: true,
  modelBrand: true,
});

export interface UserModel extends EntityModel {
  email: string,
  password: string,
  firstname: string,
  imageFolderSizeInByte: number,
  imageFolderSizeLimitInByte: number,
  imageFolder: string,
  forbidUploadingImage: boolean,
  forbidCreatingAsset: boolean,
  token: string,
  privacyPolicyAccepted: boolean,
}

export const extractUserModel = extract<UserModel>({
  _uiId: true,
  name: true,
  email: true,
  password: true,
  firstname: true,
  imageFolderSizeInByte: true,
  imageFolderSizeLimitInByte: true,
  imageFolder: true,
  forbidUploadingImage: true,
  forbidCreatingAsset: true,
  token: true,
  privacyPolicyAccepted: true,
});

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
export const extractImageModel = extract<ImageModel>({
  _uiId: true,
  name: true,
  url: true,
  thumbnailUrl: true,
  parentUiId: true,
  title: true,
  description: true,
  sizeInByte: true,
});
