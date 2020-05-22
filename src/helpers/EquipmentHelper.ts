import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line no-unused-vars
import { EquipmentModel, AgeAcquisitionType } from '../types/Types';

export function createDefaultEquipment(): EquipmentModel {
  const uuid = uuidv4();

  return {
    _uiId: uuid,
    name: '',
    brand: '',
    model: '',
    age: 0,
    installation: new Date(),
    ageAcquisitionType: AgeAcquisitionType.manualEntry,
    ageUrl: '',
  };
}

export function updateEquipment(equipment: EquipmentModel): EquipmentModel {
  // eslint-disable-next-line no-param-reassign
  equipment.installation = new Date(equipment.installation);
  return equipment;
}
