import React from 'react';
import { FormattedMessage, FormattedDate, Messages, defineMessages } from 'react-intl';

import jsonMessages from "../components/TaskTable/TaskTable.messages.json";
const tasktablemsg: Messages = defineMessages(jsonMessages);

import { TaskModel, EquipmentModel, AgeAcquisitionType } from '../types/Types';

import uuidv1 from 'uuid/v1';

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