import React, { useEffect, useState, useCallback } from 'react';

import { Alert, Progress } from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

// eslint-disable-next-line no-unused-vars
import syncService, { SyncContext } from '../../services/SyncService';

import jsonMessages from './SyncAlert.messages.json';

const syncAlertMsg = defineMessages(jsonMessages);

type Type = {
    className?: string
}

const SyncAlert = ({ className }:Type) => {
  const initialContext:SyncContext = {
    isSyncing: false,
    totalActionToSync: 0,
    remainingActionToSync: 0,
  };
  const [syncContext, setSyncContext] = useState(initialContext);

  useEffect(() => {
    syncService.registerSyncListener(setSyncContext);

    return () => syncService.unregisterSyncListener(setSyncContext);
  }, []);

  const onDismiss = useCallback(() => syncService.cancelSync(), []);

  return (
    <Alert color="warning" className={className} isOpen={syncContext.isSyncing} toggle={onDismiss}>
      <div className="text-center"><FormattedMessage {...syncAlertMsg.syncInProgress} /></div>
      <Progress animated color="warning" value={(syncContext.remainingActionToSync * 100) / syncContext.totalActionToSync}>
        {syncContext.remainingActionToSync}
/
        {syncContext.totalActionToSync}
      </Progress>
    </Alert>
  );
};

export default SyncAlert;
