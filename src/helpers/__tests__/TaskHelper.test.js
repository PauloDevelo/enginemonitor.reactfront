import * as TaskHelper from '../TaskHelper';
import timeService from '../../services/TimeService';

import { AgeAcquisitionType } from '../../types/Types';

jest.mock('../../services/TimeService');

describe('createDefaultTask', () => {
  it('should create a task with the current time for the next due date and without usage period when the equipment uses the time for the usage', () => {
    // Arrange
    const currentTime = new Date(2019, 10, 29, 18, 36);
    jest.spyOn(timeService, 'getUTCDateTime').mockReturnValue(currentTime);
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

    // Act
    const newTask = TaskHelper.createDefaultTask(equipment);

    // Assert
    expect(newTask.usagePeriodInHour).toBe(-1);
    expect(newTask.nextDueDate).toEqual(currentTime);
    expect(timeService.getUTCDateTime).toHaveBeenCalledTimes(1);
  });
});
