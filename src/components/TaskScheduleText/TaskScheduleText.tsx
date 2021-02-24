import React from 'react';

import {
  FormattedMessage, defineMessages,
} from 'react-intl';

// eslint-disable-next-line no-unused-vars
import { EquipmentModel, TaskModel, AgeAcquisitionType } from '../../types/Types';

import jsonMessages from './TaskScheduleText.messages.json';

const messages = defineMessages(jsonMessages);

type Props = {
  equipment: EquipmentModel,
  task: TaskModel,
}

const TaskScheduleText = ({ equipment, task }: Props) => {
  let title;
  const month = task.periodInMonth;
  const pluralisedMonthPeriod = <FormattedMessage {... messages.monthperiod} values={{ month }} />;

  if (equipment.ageAcquisitionType === AgeAcquisitionType.time || task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0) {
    title = (
      <span>
        <FormattedMessage {...messages.tobedonemonth} />
        <b>
          {pluralisedMonthPeriod}
        </b>
      </span>
    );
  } else {
    title = (
      <span>
        <FormattedMessage {...messages.tobedonemonth} />
        <b>
          {task.usagePeriodInHour}
          h
          {' '}
        </b>
        <FormattedMessage {...messages.orevery} />
        <b>
          {pluralisedMonthPeriod}
        </b>
      </span>
    );
  }

  return title;
};

export default TaskScheduleText;
