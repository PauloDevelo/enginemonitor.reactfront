export enum AgeAcquisitionType{
    time = 0,
    manualEntry=1,
    tracker=2
}

export type Equipment = {
    _id: string | undefined,
    name: string,
    brand: string,
    model: string,
    age: number,
    installation: Date,
    ageAcquisitionType: AgeAcquisitionType,
    ageUrl: string
}

export type Task = {
    _id: string | undefined,
    name: string,
    periodInMonth: number,
    description: string,
    nextDueDate: Date,
    usagePeriodInHour: number | undefined,
    usageInHourLeft: number | undefined,
    level: number
}

export type Entry = {
    _id: string | undefined,
    name: string,
    date: Date,
    age: number,
    remarks: string,
    taskId: string | undefined
}

export type User = {
    email: string,
    password: string,
    name: string,
    firstname: string
}

export type AuthInfo = {
    email: string,
    password: string,
    remember: boolean
}