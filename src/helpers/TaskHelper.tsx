import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';

import tasktablemsg from "../components/TaskTable/TaskTable.messages";
import { Task } from '../types/Types';

export function createDefaultTask(): Task{
	return {
		name: '',
		usagePeriodInHour: 100,
		periodInMonth: 12,
        description: '',
        nextDueDate: new Date(),
        level: 0,
        usageInHourLeft: undefined,
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

export function getTodoText(task: Task): JSX.Element{
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
    return task;
}