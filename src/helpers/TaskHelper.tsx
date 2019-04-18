import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';

import tasktablemsg from "../components/TaskTable/TaskTable.messages";
import { Task } from '../types/Types';

export function createDefaultTask(): Task{
	return {
        _id: undefined,
		name: '',
		usagePeriodInHour: 100,
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
		return 'Todo'
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

export function getTodoTextFromTask(task: Task): JSX.Element{
    var dueDate = new Date(task.nextDueDate);
    var todoText = undefined;
    if(task.usageInHourLeft === undefined || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0){
        if(task.level === 3){
            todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendone} /><b><FormattedDate value={dueDate} /></b></span>;
        }
        else{
            todoText = <span><FormattedMessage {...tasktablemsg.shouldbedone} /><b><FormattedDate value={dueDate} /></b></span>;
        }
    }
    else{
        if(task.level === 3){
            todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendonein1} /><b>{task.usageInHourLeft}h</b><FormattedMessage {...tasktablemsg.shouldhavebeendonein2} /><b><FormattedDate value={dueDate} /></b></span>;
        }
        else{
            todoText = <span><FormattedMessage {...tasktablemsg.shouldbedonein1} /><b>{task.usageInHourLeft}h</b><FormattedMessage {...tasktablemsg.shouldbedonein2} /><b><FormattedDate value={dueDate} /></b></span>;
        }
    }
    
    return todoText;
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

export function getTodoValue(task: Task): TaskTodo{
    return {
        dueDate: new Date(task.nextDueDate),
        onlyDate: task.usageInHourLeft === undefined || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0,
        level: task.level,
        usageInHourLeft: task.usageInHourLeft
    }
}

export function getScheduleText(task: Task){
    var title = undefined;
    var month = task.periodInMonth;
    var pluralisedMonthPeriod = <FormattedMessage {... tasktablemsg.monthperiod} values={{month}}/>

    if(task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0){
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

export function updateTask(task: Task): Task {
    task.usagePeriodInHour = task.usagePeriodInHour === -1 ? undefined : task.usagePeriodInHour
    task.nextDueDate = new Date(task.nextDueDate);
    return task;
}