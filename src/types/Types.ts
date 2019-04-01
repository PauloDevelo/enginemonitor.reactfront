export type Equipment = {
    _id: string | undefined,
    name: string,
    brand: string,
    model: string,
    age: number,
    installation: Date
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