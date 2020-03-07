import React, { useEffect, useState, useCallback } from 'react';

import { Alert, Progress } from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import syncService from '../../services/SyncService';
// eslint-disable-next-line no-unused-vars
import { TaskWithProgressContext } from '../../services/TaskWithProgress';

import jsonMessages from './SyncAlert.messages.json';

const syncAlertMsg = defineMessages(jsonMessages);

type Type = {
    className?: string
}

const SyncAlert = ({ className }:Type) => {
  const [syncContext, setSyncContext] = useState<TaskWithProgressContext>(syncService.getContext());

  const setSyncContextAsync = async (context: TaskWithProgressContext) => {
    setSyncContext(context);
  };

  useEffect(() => {
    syncService.registerSyncListener(setSyncContextAsync);

    return () => syncService.unregisterSyncListener(setSyncContextAsync);
  }, []);

  const onDismiss = useCallback(() => syncService.cancel(), []);

  return (
    <Alert color="warning" className={className} isOpen={syncContext.isRunning} toggle={onDismiss}>
      <div className="text-center"><FormattedMessage {...syncAlertMsg.syncInProgress} /></div>
      <Progress animated color="warning" value={(syncContext.remaining * 100) / syncContext.total}>
        {syncContext.remaining}
/
        {syncContext.total}
      </Progress>
    </Alert>
  );
};

export default SyncAlert;
