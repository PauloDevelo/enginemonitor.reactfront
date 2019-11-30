import uuidv1 from 'uuid/v1';
import moment from 'moment';
import {
  // eslint-disable-next-line no-unused-vars
  TaskModel, EquipmentModel, AgeAcquisitionType, EntryModel, TaskLevel, TaskTodo,
} from '../types/Types';

import timeService from '../services/TimeService';
import entryProxy from '../services/EntryProxy';
import equipmentProxy from '../services/EquipmentProxy';

export function createDefaultTask(equipment: EquipmentModel): TaskModel {
  const uuid = uuidv1();
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

async function getLastEntry(equipmentId:string, taskId:string): Promise<EntryModel|undefined> {
  const query = (e:EntryModel) => e.equipmentUiId === equipmentId && e.taskUiId === taskId;
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

async function getLastEntryDate(equipment: EquipmentModel, task:TaskModel): Promise<Date> {
  const lastEntry = await getLastEntry(equipment._uiId, task._uiId);
  if (lastEntry != null) {
    return lastEntry.date;
  }
  return equipment.installation;
}

async function getNextDueDate(equipment: EquipmentModel, task:TaskModel): Promise<Date> {
  const nextDueDate = moment(await getLastEntryDate(equipment, task));
  nextDueDate.add(task.periodInMonth, 'M');

  return nextDueDate.toDate();
}

async function getLastEntryAge(equipmentId: string, taskId: string): Promise<number> {
  const lastEntry = await await getLastEntry(equipmentId, taskId);
  if (lastEntry != null) {
    return lastEntry.age;
  }
  return 0;
}

async function getTimeInHourLeft(equipment: EquipmentModel, task: TaskModel): Promise<number> {
  if (task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0) {
    return 0;
  }

  return task.usagePeriodInHour + await getLastEntryAge(equipment._uiId, task._uiId) - equipment.age;
}

async function getLevel(equipment: EquipmentModel, task: TaskModel): Promise<number> {
  const { nextDueDate } = task;
  const now = new Date();
  const delayInMillisecond = nextDueDate.getTime() - now.getTime();
  let level = TaskLevel.done;


  if (equipment.ageAcquisitionType !== AgeAcquisitionType.time && task.usagePeriodInHour && task.usagePeriodInHour !== -1 && task.usageInHourLeft) {
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

export async function updateRealtimeFields(equipmentId:string, task: TaskModel): Promise<void> {
  const equipment = (await equipmentProxy.getStoredEquipment()).find((eq) => eq._uiId === equipmentId);

  if (equipment !== undefined) {
    // The order of these 3 function calls is important since they might rely on the result computed in the function called before.
    const updatedTask = { ...task };
    updatedTask.nextDueDate = await getNextDueDate(equipment, updatedTask);
    updatedTask.usageInHourLeft = await getTimeInHourLeft(equipment, updatedTask);
    updatedTask.level = await getLevel(equipment, updatedTask);
  }
}
