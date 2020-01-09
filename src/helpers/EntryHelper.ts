import uuidv1 from 'uuid/v1.js';

import {
  // eslint-disable-next-line no-unused-vars
  EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType,
} from '../types/Types';

export function createDefaultEntry(equipment:EquipmentModel, task: TaskModel | undefined): EntryModel {
  const uuid = uuidv1();
  let defaultAge = -1;
  if (equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
    defaultAge = equipment.age;
  }

  return {
    _uiId: uuid,
    name: task ? task.name : '',
    date: new Date(),
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
