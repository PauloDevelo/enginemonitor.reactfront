import React, { Fragment, useEffect, useState } from 'react';

import {UncontrolledAlert, Progress} from 'reactstrap';

import { FormattedMessage, Messages, defineMessages } from 'react-intl';

import syncService, {SyncContext} from '../../services/SyncService';

import jsonMessages from "./SyncAlert.messages.json";
const syncAlertMsg: Messages = defineMessages(jsonMessages);

type Type = {
    className: string
}

const SyncAlert = ({className}:Type) => {
    const initialContext:SyncContext = {
        isSyncing : false,
        totalActionToSync : 0,
        remainingActionToSync : 0
    };
    const [syncContext, setSyncContext] = useState(initialContext);

    useEffect(() => {
        syncService.registerSyncListener(setSyncContext);
        
        return () => syncService.unregisterSyncListener(setSyncContext);
    }, []);


    return (
        <Fragment>
            {syncContext.isSyncing && <UncontrolledAlert color="warning" className={className}>
                <div className="text-center"><FormattedMessage {...syncAlertMsg.syncInProgress} /></div>
                <Progress animated color="warning" value={syncContext.remainingActionToSync * 100 / syncContext.totalActionToSync} >{syncContext.remainingActionToSync}/{syncContext.totalActionToSync}</Progress>
            </UncontrolledAlert>}
        </Fragment>
    );
}

export default SyncAlert;