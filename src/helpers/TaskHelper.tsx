import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import log from 'loglevel';

import {
  // eslint-disable-next-line no-unused-vars
  TaskModel, EquipmentModel, AgeAcquisitionType, EntryModel, TaskLevel, TaskTodo,
} from '../types/Types';

import timeService from '../services/TimeService';
import entryProxy from '../services/EntryProxy';
import equipmentProxy from '../services/EquipmentProxy';

export function createDefaultTask(equipment: EquipmentModel): TaskModel {
  const uuid = uuidv4();
  return {
    _uiId: uuid,
    name: '',
    usagePeriodInHour: equipment.ageAcquisitionType !== AgeAcquisitionType.time ? 100 : -1,
    periodInMonth: 12,
    description: '',
    nextDueDate: timeService.getUTCDateTime(),
    level: TaskLevel.todo,
    usageInHourLeft: undefined,
  };
}

export function getBadgeText(level: TaskLevel):string {
  if (level === TaskLevel.done) {
    return 'Done';
  }
  if (level === TaskLevel.soon) {
    return 'Soon';
  }

  return 'ToDo';
}

export function getContext(level: TaskLevel): string {
  if (level === TaskLevel.done) {
    return 'success';
  }
  if (level === TaskLevel.soon) {
    return 'warning';
  }
  if (level === TaskLevel.todo) {
    return 'danger';
  }

  return 'primary';
}

export function getColor(level: TaskLevel): string {
  if (level === TaskLevel.done) {
    return '#C3E5CA';
  }
  if (level === TaskLevel.soon) {
    return '#FFEEBA';
  }
  if (level === TaskLevel.todo) {
    return '#F5C6CC';
  }

  return 'white';
}

export function getTodoValue(equipment: EquipmentModel, task: TaskModel): TaskTodo {
  return {
    dueDate: new Date(task.nextDueDate),
    onlyDate: equipment.ageAcquisitionType === AgeAcquisitionType.time || task.usageInHourLeft === undefined || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0,
    level: task.level,
    usageInHourLeft: task.usageInHourLeft,
  };
}

export function shorten(longStr: string): string {
  let shortenStr = longStr;
  if (shortenStr.length > 80) {
    shortenStr = `${longStr.substring(0, 80)} ...`;
  }

  return shortenStr;
}

export function updateTask(task: TaskModel): TaskModel {
  const updatedTask = { ...task };
  updatedTask.usagePeriodInHour = task.usagePeriodInHour === -1 ? undefined : task.usagePeriodInHour;
  updatedTask.nextDueDate = new Date(task.nextDueDate);
  return updatedTask;
}

async function getLastAckEntry(equipmentId:string, taskId:string): Promise<EntryModel|undefined> {
  const query = (e:EntryModel) => e.equipmentUiId === equipmentId && e.taskUiId === taskId && e.ack;
  let entries = (await entryProxy.getStoredEntries(equipmentId, taskId)).filter(query);
  entries = entries.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    } if (a.date < b.date) {
      return 1;
    }
    return 0;
  });

  if (entries.length === 0) {
    return undefined;
  }
  return entries[0];
}

async function getLastAckEntryDate(equipment: EquipmentModel, task:TaskModel): Promise<Date> {
  const lastEntry = await getLastAckEntry(equipment._uiId, task._uiId);
  if (lastEntry !== undefined) {
    return lastEntry.date;
  }
  return equipment.installation;
}

async function getNextDueDate(equipment: EquipmentModel, task:TaskModel): Promise<Date> {
  const nextDueDate = moment(await getLastAckEntryDate(equipment, task));
  nextDueDate.add(task.periodInMonth, 'M');

  return nextDueDate.toDate();
}

async function getLastAckEntryAge(equipmentId: string, taskId: string): Promise<number> {
  const lastEntry = await await getLastAckEntry(equipmentId, taskId);
  if (lastEntry != null) {
    return lastEntry.age;
  }
  return 0;
}

async function getTimeInHourLeft(equipment: EquipmentModel, task: TaskModel): Promise<number | undefined> {
  if (task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0) {
    return undefined;
  }

  return task.usagePeriodInHour + await getLastAckEntryAge(equipment._uiId, task._uiId) - equipment.age;
}

async function getLevel(equipment: EquipmentModel, task: TaskModel): Promise<number> {
  const { nextDueDate } = task;
  const now = timeService.getUTCDateTime();
  const delayInMillisecond = nextDueDate.getTime() - now.getTime();
  let level = TaskLevel.done;

  if (equipment.ageAcquisitionType !== AgeAcquisitionType.time && task.usagePeriodInHour && task.usagePeriodInHour !== -1 && task.usageInHourLeft !== undefined) {
    const usageHourLeft = task.usageInHourLeft;

    if (usageHourLeft <= 0 || nextDueDate <= now) {
      level = TaskLevel.todo;
    } else if (usageHourLeft < Math.round(task.usagePeriodInHour / 10 + 0.5)
                   || Math.abs(delayInMillisecond) <= task.periodInMonth * 30.5 * 24 * 360000.5) {
      level = TaskLevel.soon;
    } else {
      level = TaskLevel.done;
    }
  } else if (nextDueDate <= now) {
    level = TaskLevel.todo;
  } else if (Math.abs(delayInMillisecond) <= task.periodInMonth * 30.5 * 24 * 360000.5) {
    level = TaskLevel.soon;
  } else {
    level = TaskLevel.done;
  }

  return level;
}

export async function updateRealtimeFields(equipmentId:string, task: TaskModel): Promise<TaskModel> {
  const equipment = (await equipmentProxy.getStoredEquipment()).find((eq) => eq._uiId === equipmentId);

  if (equipment === undefined) {
    return task;
  }

  // The order of these 3 function calls is important since they might rely on the result computed in the function called before.
  const updatedTask = { ...task };

  try {
    updatedTask.nextDueDate = await getNextDueDate(equipment, updatedTask);
    updatedTask.usageInHourLeft = await getTimeInHourLeft(equipment, updatedTask);
    updatedTask.level = await getLevel(equipment, updatedTask);
  } catch (error) {
    log.warn(error.message);
  }

  return updatedTask;
}
