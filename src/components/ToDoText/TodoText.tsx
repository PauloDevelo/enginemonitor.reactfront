// eslint-disable-next-line no-use-before-define
import React from 'react';

import {
  FormattedMessage, FormattedDate, defineMessages,
} from 'react-intl';

// eslint-disable-next-line no-unused-vars
import { TaskLevel } from '../../types/Types';

import jsonMessages from './ToDoText.messages.json';

const todotextmsg = defineMessages(jsonMessages);

type TaskTodoProps = {
  dueDate: Date,
  onlyDate: boolean,
  level: TaskLevel,
  usageInHourLeft: number | undefined,
  className?: string
}

const ToDoText = ({
  dueDate, onlyDate, level, usageInHourLeft, className,
}: TaskTodoProps) => {
  let todoText;
  if (onlyDate) {
    if (level === TaskLevel.todo) {
      todoText = (
        <span className={className}>
          <FormattedMessage {...todotextmsg.shouldhavebeendone} />
          <b><FormattedDate value={dueDate} /></b>
        </span>
      );
    } else {
      todoText = (
        <span className={className}>
          <FormattedMessage {...todotextmsg.shouldbedone} />
          <b><FormattedDate value={dueDate} /></b>
        </span>
      );
    }
  } else if (level === TaskLevel.todo) {
    todoText = (
      <span className={className}>
        <FormattedMessage {...todotextmsg.shouldhavebeendonein1} />
        <b>
          {usageInHourLeft}
          h
        </b>
        <FormattedMessage {...todotextmsg.shouldhavebeendonein2} />
        <b><FormattedDate value={dueDate} /></b>
      </span>
    );
  } else {
    todoText = (
      <span className={className}>
        <FormattedMessage {...todotextmsg.shouldbedonein1} />
        <b>
          {usageInHourLeft}
          h
        </b>
        <FormattedMessage {...todotextmsg.shouldbedonein2} />
        <b><FormattedDate value={dueDate} /></b>
      </span>
    );
  }

  return todoText;
};

export default ToDoText;
