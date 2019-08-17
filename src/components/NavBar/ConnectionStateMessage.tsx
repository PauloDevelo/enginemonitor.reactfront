import React from "react";

import { FormattedMessage, Messages, defineMessages } from 'react-intl';

import jsonMessages from "./NavBar.messages.json";
const navBarMsg: Messages = defineMessages(jsonMessages);

type ConnectionState = {
    isOnline: boolean,
    isSynced: boolean
};

const ConnectionStateMessage = ({isOnline, isSynced}:ConnectionState) => {
    if(isSynced){
        if (isOnline){
            return <FormattedMessage {...navBarMsg.online} />
        }
        else{
            return <FormattedMessage {...navBarMsg.notonline} />
        }
    }
    else{
        if (isOnline){
            return <FormattedMessage {...navBarMsg.syncAction} />
        }
        else{
            return <FormattedMessage {...navBarMsg.notonline} />
        }
    }
}

export default React.memo(ConnectionStateMessage);