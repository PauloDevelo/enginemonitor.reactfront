import React, { useState, useEffect } from "react";
import {  DropdownItem } from 'reactstrap';

import ConnectionStateMessage from './ConnectionStateMessage';
import NbActionPending from './NbActionPending';

import { faPlug, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import syncService from '../../services/SyncService';
import actionManager from '../../services/ActionManager';

type ConnectionState = {
    isOnline: boolean,
    isSynced: boolean
};

const ConnectionStateIcon = ({isOnline, isSynced}:ConnectionState) => {
    if (isOnline){
        return <FontAwesomeIcon icon={faPlug} />
    }
    else{
        return <FontAwesomeIcon icon={faBan} />
    }
}

const DropDownConnectionStateItem = ({}) => {
    const [isOnline, onIsOnlineChanged] = useState(false);
    const [isSync, onIsSynced] = useState(false);

    const onActionManagerChanged = (nbAction: number): void => {
        onIsSynced(nbAction === 0);
    }
    
    useEffect(() => {
        syncService.registerIsOnlineListener(onIsOnlineChanged);
        onIsOnlineChanged(syncService.isOnline());

        actionManager.registerOnActionManagerChanged(onActionManagerChanged);
        actionManager.countAction().then((nbAction: number) => {
            onActionManagerChanged(nbAction);
        });

        return () => {
            syncService.unregisterIsOnlineListener(onIsOnlineChanged);
            actionManager.unregisterOnActionManagerChanged(onActionManagerChanged);
        }
    }, []);

	return (
        <DropdownItem disabled={isOnline === false || isSync === true} onClick={syncService.synchronize}>
            <ConnectionStateIcon isOnline={isOnline} isSynced={isSync}/>{' '}<ConnectionStateMessage isOnline={isOnline} isSynced={isSync}/>{' ('}<NbActionPending/>{')'}
        </DropdownItem>
	);
}

export default DropDownConnectionStateItem;