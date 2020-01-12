import ignoredMessages from '../../testHelpers/MockConsole';
import * as EntryHelper from '../EntryHelper';

import timeService from '../../services/TimeService';

import { AgeAcquisitionType } from '../../types/Types';

jest.mock('../../services/TimeService');

describe('EntryHelper', () => {
  const equipment = {
    _uiId: 'equipment_01',
    name: 'engine',
    brand: 'nanni',
    model: 'N3.30',
    age: 1234,
    installation: new Date(2011, 7, 29, 18, 36),
    ageAcquisitionType: AgeAcquisitionType.time,
    ageUrl: '',
  };

  const task = {
    _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end',
    name: 'Vidange',
    usagePeriodInHour: 500,
    periodInMonth: 12,
    description: "Changer l'huile",
    nextDueDate: new Date('2020-07-09T16:00:00.000Z'),
    level: 0,
    usageInHourLeft: undefined,
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
  });

  beforeEach(() => {
  });

  afterEach(() => {
    timeService.getUTCDateTime.mockRestore();
  });

  describe('createDefaultEntry', () => {
    it('should create an entry with the current time and the ack option set to true', () => {
      // Arrange
      const currentTime = new Date(2019, 10, 29, 18, 36);
      timeService.getUTCDateTime.mockReturnValue(currentTime);

      // Act
      const newEntry = EntryHelper.createDefaultEntry(equipment, task);

      // Assert
      expect(newEntry.equipmentUiId).toBe(equipment._uiId);
      expect(newEntry.taskUiId).toBe(task._uiId);
      expect(newEntry.date).toEqual(currentTime);
      expect(newEntry.ack).toEqual(true);
    });

    it('should create an entry with an undefined task', () => {
      // Arrange
      const currentTime = new Date(2019, 10, 29, 18, 36);
      timeService.getUTCDateTime.mockReturnValue(currentTime);

      // Act
      const newEntry = EntryHelper.createDefaultEntry(equipment);

      // Assert
      expect(newEntry.equipmentUiId).toBe(equipment._uiId);
      expect(newEntry.taskUiId).toBeUndefined();
      expect(newEntry.date).toEqual(currentTime);
      expect(newEntry.ack).toEqual(true);
    });
  });
});
