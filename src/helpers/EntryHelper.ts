import { v4 as uuidv4 } from 'uuid';
import timeService from '../services/TimeService';

import {
  // eslint-disable-next-line no-unused-vars
  EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType,
} from '../types/Types';

export function createDefaultEntry(equipment:EquipmentModel, task: TaskModel | undefined): EntryModel {
  const uuid = uuidv4();
  let defaultAge = -1;
  if (equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
    defaultAge = equipment.age;
  }

  return {
    _uiId: uuid,
    name: task ? task.name : '',
    date: timeService.getUTCDateTime(),
    age: defaultAge,
    remarks: '',
    taskUiId: task ? task._uiId : undefined,
    equipmentUiId: equipment._uiId,
    ack: true,
  };
}

export function updateEntry(entry: EntryModel): EntryModel {
  entry.date = new Date(entry.date);
  return entry;
}
