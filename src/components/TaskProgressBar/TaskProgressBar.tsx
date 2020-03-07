import React, { useEffect, useState, useCallback } from 'react';

import { Alert, Progress } from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

// eslint-disable-next-line no-unused-vars
import { ITaskWithProgressContext, TaskWithProgress } from '../../services/TaskWithProgress';

import jsonMessages from './TaskProgressBar.messages.json';

const titles = defineMessages(jsonMessages);

type Type = {
    taskWithProgress: TaskWithProgress,
    title: 'syncInProgress' | 'rebuildInProgress',
    color: string,
    className?: string,
}

const TaskProgressBar = ({
  taskWithProgress, title, color, className,
}:Type) => {
  const [syncContext, setSyncContext] = useState<ITaskWithProgressContext>(taskWithProgress.getContext());

  const setSyncContextAsync = async (context: ITaskWithProgressContext) => {
    setSyncContext(context);
  };

  useEffect(() => {
    taskWithProgress.registerListener(setSyncContextAsync);

    return () => taskWithProgress.unregisterListener(setSyncContextAsync);
  }, [taskWithProgress]);

  return (
    <Alert color={color} className={className} isOpen={syncContext.isRunning} toggle={taskWithProgress.cancel}>
      <div className="text-center"><FormattedMessage {...titles[title]} /></div>
      <Progress animated color={color} value={(syncContext.remaining * 100) / syncContext.total}>
        {syncContext.remaining}
/
        {syncContext.total}
      </Progress>
    </Alert>
  );
};

export default TaskProgressBar;
