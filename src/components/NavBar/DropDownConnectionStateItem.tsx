import React, { useState, useEffect } from "react";
import {  DropdownItem } from 'reactstrap';

import { faPlug, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, Messages, defineMessages } from 'react-intl';

import syncService from '../../services/SyncService';
import actionManager from '../../services/ActionManager';

import jsonMessages from "./NavBar.messages.json";
const navBarMsg: Messages = defineMessages(jsonMessages);

type ConnectionState = {
    isOnline: boolean
};

const ConnectionStateMessage = ({isOnline}:ConnectionState) => {
    if (isOnline){
        return <FormattedMessage {...navBarMsg.online} />
    }
    else{
        return <FormattedMessage {...navBarMsg.notonline} />
    }
}

const ConnectionStateIcon = ({isOnline}:ConnectionState) => {
    if (isOnline){
        return <FontAwesomeIcon icon={faPlug} />
    }
    else{
        return <FontAwesomeIcon icon={faBan} />
    }
}

const NbActionPending = ({}) => {
    const [nbAction, setActionCounter] = useState(0);

    useEffect(() => {
        actionManager.registerOnActionManagerChanged(setActionCounter);
        actionManager.countAction().then(setActionCounter);

        return () => {
            actionManager.unregisterOnActionManagerChanged(setActionCounter);
        }
    }, []);

    return <FormattedMessage {... navBarMsg.nbAction} values={{nbAction}}/>
}

const DropDownConnectionStateItem = ({}) => {
    const [isOnline, onIsOnlineChanged] = useState(false);
    
    useEffect(() => {
        syncService.registerIsOnlineListener(onIsOnlineChanged);
        syncService.isOnline().then(onIsOnlineChanged);

        return () => {
            syncService.unregisterIsOnlineListener(onIsOnlineChanged);
        }
    }, []);

	return (
        <DropdownItem disabled>
            <ConnectionStateIcon isOnline={isOnline}/>{' '}<ConnectionStateMessage isOnline={isOnline}/>{' ('}<NbActionPending/>{')'}
        </DropdownItem>
	);
}

export default DropDownConnectionStateItem;