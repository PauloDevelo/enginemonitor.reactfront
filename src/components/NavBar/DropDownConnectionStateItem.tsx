import React, { useState, useEffect } from 'react';
import { DropdownItem } from 'reactstrap';

import { faPlug, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectionStateMessage from './ConnectionStateMessage';
import NbActionPending from './NbActionPending';

import onlineManager from '../../services/OnlineManager';
import syncService from '../../services/SyncService';
import actionManager from '../../services/ActionManager';

type ConnectionState = {
    isOnline: boolean,
    isSynced: boolean
};

// eslint-disable-next-line no-unused-vars
const ConnectionStateIcon = ({ isOnline, isSynced }:ConnectionState) => {
  if (isOnline) {
    return <FontAwesomeIcon icon={faPlug} />;
  }

  return <FontAwesomeIcon icon={faBan} />;
};

const DropDownConnectionStateItem = () => {
  const [isOnline, onIsOnlineChanged] = useState(false);
  const [isSync, onIsSynced] = useState(false);

  const onActionManagerChanged = (nbAction: number): void => {
    onIsSynced(nbAction === 0);
  };

  useEffect(() => {
    onlineManager.registerIsOnlineListener(onIsOnlineChanged);
    onlineManager.isOnline().then((online) => onIsOnlineChanged(online));

    actionManager.registerOnActionManagerChanged(onActionManagerChanged);
    onActionManagerChanged(actionManager.countAction());

    return () => {
      onlineManager.unregisterIsOnlineListener(onIsOnlineChanged);
      actionManager.unregisterOnActionManagerChanged(onActionManagerChanged);
    };
  }, []);

  return (
    <DropdownItem disabled={isOnline === false || isSync === true} onClick={() => syncService.tryToRun()}>
      <ConnectionStateIcon isOnline={isOnline} isSynced={isSync} />
      {' '}
      <ConnectionStateMessage isOnline={isOnline} isSynced={isSync} />
      (
      <NbActionPending />
      )
    </DropdownItem>
  );
};

export default DropDownConnectionStateItem;
