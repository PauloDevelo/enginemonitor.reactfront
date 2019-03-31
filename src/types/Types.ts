export type Equipment = {
    name: string,
    brand: string,
    model: string,
    age: number,
    installation: Date
}

export type Task = {
    name: string,
    periodInMonth: number,
    description: string,
    nextDueDate: Date,
    usagePeriodInHour: number | undefined,
    usageInHourLeft: number | undefined,
    level: number
}

export type Entry = {
    name: string,
    date: Date,
    age: number,
    remarks: string,
}