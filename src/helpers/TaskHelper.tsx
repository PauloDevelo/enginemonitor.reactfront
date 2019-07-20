import React from 'react';
import { FormattedMessage, FormattedDate, Messages, defineMessages } from 'react-intl';

import jsonMessages from "../components/TaskTable/TaskTable.messages.json";
const tasktablemsg: Messages = defineMessages(jsonMessages);

import { TaskModel, EquipmentModel, AgeAcquisitionType, EntryModel } from '../types/Types';
import entryProxy from '../services/EntryProxy';
import equipmentProxy from '../services/EquipmentProxy';

import uuidv1 from 'uuid/v1';
import moment from 'moment';

export function createDefaultTask(equipment: EquipmentModel): TaskModel{
    const uuid = uuidv1();

	return {
        _uiId: uuid,
		name: '',
		usagePeriodInHour: equipment.ageAcquisitionType !== AgeAcquisitionType.time ? 100 : -1,
		periodInMonth: 12,
        description: '',
        nextDueDate: new Date(),
        level: 0,
        usageInHourLeft: undefined,
	}
}

export function getBadgeText(level: number):string{
	if(level === 1){
		return 'Done'
	}
	else if(level === 2){
		return 'Soon'
	}
	else{
		return 'ToDo'
	}
}

export function getContext(level: number): string{
	if(level === 1){
		return "success";
	}
	else if(level === 2){
		return "warning";
	}
	else if(level === 3){
		return "danger";
    }
    else{
        return "primary";
    }
}

export function getColor(level: number): string{
	if(level === 1){
		return "#C3E5CA";
	}
	else if(level === 2){
		return "#FFEEBA";
	}
	else if(level === 3){
		return "#F5C6CC";
    }
    else{
        return "white";
    }
}

export type TaskTodo = {
    dueDate: Date,
    onlyDate: boolean,
    level: number,
    usageInHourLeft: number | undefined
}

export function getTodoText(todo: TaskTodo): JSX.Element{
    let todoText = undefined;
    if(todo.onlyDate){
        if(todo.level === 3){
            todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendone} /><b><FormattedDate value={todo.dueDate} /></b></span>;
        }
        else{
            todoText = <span><FormattedMessage {...tasktablemsg.shouldbedone} /><b><FormattedDate value={todo.dueDate} /></b></span>;
        }
    }
    else{
        if(todo.level === 3){
            todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendonein1} /><b>{todo.usageInHourLeft}h</b><FormattedMessage {...tasktablemsg.shouldhavebeendonein2} /><b><FormattedDate value={todo.dueDate} /></b></span>;
        }
        else{
            todoText = <span><FormattedMessage {...tasktablemsg.shouldbedonein1} /><b>{todo.usageInHourLeft}h</b><FormattedMessage {...tasktablemsg.shouldbedonein2} /><b><FormattedDate value={todo.dueDate} /></b></span>;
        }
    }
    
    return todoText;
}

export function getTodoValue(equipment: EquipmentModel, task: TaskModel): TaskTodo{
    return {
        dueDate: new Date(task.nextDueDate),
        onlyDate: equipment.ageAcquisitionType === AgeAcquisitionType.time || task.usageInHourLeft === undefined || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0,
        level: task.level,
        usageInHourLeft: task.usageInHourLeft
    }
}

export function getScheduleText(equipment: EquipmentModel, task: TaskModel){
    var title = undefined;
    var month = task.periodInMonth;
    var pluralisedMonthPeriod = <FormattedMessage {... tasktablemsg.monthperiod} values={{month}}/>

    if(equipment.ageAcquisitionType === AgeAcquisitionType.time || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0){
        title = <span>
                    <FormattedMessage {...tasktablemsg.tobedonemonth} />
                    <b>
                        {pluralisedMonthPeriod}
                    </b>
                </span>;
    }
    else{
        title = 
        <span>
            <FormattedMessage {...tasktablemsg.tobedonemonth} /><b>{task.usagePeriodInHour}{' h'} </b>
            <FormattedMessage {...tasktablemsg.orevery} />
            <b>
                {pluralisedMonthPeriod}
            </b>
        </span>
    }

    return title;
}

export function shorten(longStr: string): string{
	var shortenStr = longStr;
	if(shortenStr.length > 80){
		shortenStr = longStr.substring(0, 80) + ' ...';
	}
	
	return shortenStr;
}

export function updateTask(task: TaskModel): TaskModel {
    task.usagePeriodInHour = task.usagePeriodInHour === -1 ? undefined : task.usagePeriodInHour
    task.nextDueDate = new Date(task.nextDueDate);
    return task;
}

export async function updateRealtimeFields(equipmentId:string, task: TaskModel): Promise<void>{
    const equipment = (await equipmentProxy.getStoredEquipment()).find(equipment => equipment._uiId === equipmentId);
    
    // The order of these 3 function calls is important since they might rely on the result computed in the function called before.
    await updateNextDueDate(equipment, task);
    await updateTimeInHourLeft(equipment, task);
    await updateLevel(equipment, task);
}

async function getLastEntry(equipmentId:string, taskId:string): Promise<EntryModel|undefined> {
    const query = (e:EntryModel) => e.equipmentUiId === equipmentId && e.taskUiId === taskId;
    let entries = (await entryProxy.getStoredEntries(equipmentId, taskId)).filter(query);
    entries = entries.sort((a, b) => {
        if ( a.date > b.date) {
            return -1;
        } else if ( a.date < b.date) {
            return 1;
        } else {
            return 0;
        }
    });

    if (entries.length === 0) {
        return undefined;
    } else {
        return entries[0];
    }
};

async function getLastEntryAge(equipmentId: string, taskId: string): Promise<number> {
    const lastEntry = await await getLastEntry(equipmentId, taskId);
    if (lastEntry != null) {
        return lastEntry.age;
    } else {
        return 0;
    }
};

async function updateTimeInHourLeft(equipment: EquipmentModel | undefined, task: TaskModel): Promise<void> {
    if (task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0) {
        task.usageInHourLeft = 0;
        return;
    }

    if(equipment === undefined ){
        return;
    }
    
    task.usageInHourLeft = task.usagePeriodInHour + await getLastEntryAge(equipment._uiId, task._uiId) - equipment.age;
};

async function getLastEntryDate(equipment: EquipmentModel, task:TaskModel): Promise<Date> {
    const lastEntry = await getLastEntry(equipment._uiId, task._uiId);
    if (lastEntry != null) {
        return lastEntry.date;
    } else {
        return equipment.installation;
    }
};

async function updateNextDueDate(equipment: EquipmentModel | undefined, task:TaskModel): Promise<void> {
    if(equipment !== undefined){
        const nextDueDate = moment(await getLastEntryDate(equipment, task));
        nextDueDate.add(task.periodInMonth, "M");
    
        task.nextDueDate = nextDueDate.toDate();
    }
};

async function updateLevel(equipment: EquipmentModel| undefined, task: TaskModel): Promise<void> {
    const nextDueDate = task.nextDueDate;
    const now = new Date();
    const delayInMillisecond = nextDueDate.getTime() - now.getTime();
    let level = 1;


    if (equipment && equipment.ageAcquisitionType !== AgeAcquisitionType.time && task.usagePeriodInHour && task.usagePeriodInHour !== -1 && task.usageInHourLeft) {
        const usageHourLeft = task.usageInHourLeft;

        if (usageHourLeft <= 0 || nextDueDate <= now) {
            level = 3;
        } else if (usageHourLeft < Math.round(task.usagePeriodInHour / 10 + 0.5) ||
                   Math.abs(delayInMillisecond) <= task.periodInMonth * 30.5 * 24 * 360000.5) {
            level = 2;
        } else {
            level = 1;
        }
    } else {
        if (nextDueDate <= now) {
            level = 3;
        } else if (Math.abs(delayInMillisecond) <= task.periodInMonth * 30.5 * 24 * 360000.5) {
            level = 2;
        } else {
            level = 1;
        }
    }

    task.level = level;
};