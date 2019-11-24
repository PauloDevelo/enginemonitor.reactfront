import React, { useState, useEffect } from 'react';

import { FormattedMessage, defineMessages } from 'react-intl';

import actionManager from '../../services/ActionManager';

import jsonMessages from './NavBar.messages.json';

const navBarMsg = defineMessages(jsonMessages);


const NbActionPending = () => {
  const [nbAction, setActionCounter] = useState(0);

  useEffect(() => {
    actionManager.registerOnActionManagerChanged(setActionCounter);
    actionManager.countAction().then(setActionCounter);

    return () => {
      actionManager.unregisterOnActionManagerChanged(setActionCounter);
    };
  }, []);

  return <FormattedMessage {... navBarMsg.nbAction} values={{ nbAction }} />;
};

export default NbActionPending;
