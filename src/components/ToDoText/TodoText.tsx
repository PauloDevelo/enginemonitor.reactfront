import React from 'react';

import {
  // eslint-disable-next-line no-unused-vars
  FormattedMessage, FormattedDate, MessageDescriptor, defineMessages,
} from 'react-intl';

import { TaskLevel, TaskTodo } from '../../types/Types';

import jsonMessages from './ToDoText.messages.json';

const todotextmsg = defineMessages(jsonMessages);

const ToDoText = ({
  dueDate, onlyDate, level, usageInHourLeft,
}: TaskTodo) => {
  let todoText;
  if (onlyDate) {
    if (level === TaskLevel.todo) {
      todoText = (
        <span>
          <FormattedMessage {...todotextmsg.shouldhavebeendone} />
          <b><FormattedDate value={dueDate} /></b>
        </span>
      );
    } else {
      todoText = (
        <span>
          <FormattedMessage {...todotextmsg.shouldbedone} />
          <b><FormattedDate value={dueDate} /></b>
        </span>
      );
    }
  } else if (level === TaskLevel.todo) {
    todoText = (
      <span>
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
      <span>
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
