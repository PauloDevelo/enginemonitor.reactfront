import React, { useState, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';

import _ from 'lodash';

import logger from 'loglevel';

import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import Alerts from '../Alerts/Alerts';
import HttpError from '../../http/HttpError';
import userProxy from '../../services/UserProxy';

import '../../style/transition.css';

import jsonMessages from './DeleteUserModal.messages.json';
import ActionButton from '../ActionButton/ActionButton';

const modalmsg = defineMessages(jsonMessages);

type Props = {
    isOpen: boolean,
    toggle: () => void,
    onUserDeleted: () => void,
    className?: string,
}

const shouldDeletingButtonDisabled = (confirmationMsg: string) => {
  const cleanedConfirmationMsg = _.lowerCase(_.trim(confirmationMsg));
  return cleanedConfirmationMsg !== 'yes' && cleanedConfirmationMsg !== 'oui';
};

const DeleteUserModal = ({
  isOpen,
  toggle,
  onUserDeleted,
  className,
}: Props) => {
  const intl = useIntl();
  const [isActing, setActing] = useState(false);
  const [isDeleteButtonDisabled, setDeleteButtonDisabled] = useState(true);
  const [alerts, setAlerts] = useState<any>(undefined);

  const deleteUser = async () => {
    setActing(true);
    try {
      await userProxy.deleteUser();
      await userProxy.logout();
      toggle();
      onUserDeleted();
      setAlerts(undefined);
      setDeleteButtonDisabled(true);
    } catch (error) {
      if (error instanceof HttpError) {
        setAlerts(error.data);
      } else {
        logger.error(error);
      }
    } finally {
      setActing(false);
    }
  };

  const cancel = () => {
    setAlerts(undefined);
    toggle();
  };

  const onChangeHandler = useCallback((event:React.ChangeEvent<HTMLInputElement>):void => {
    const target:HTMLInputElement = event.target as HTMLInputElement;
    setDeleteButtonDisabled(shouldDeletingButtonDisabled(target.value));
    setAlerts(undefined);
  }, []);

  return (
    <Modal isOpen={isOpen} toggle={toggle} className={className} fade>
      <ModalHeader toggle={toggle}><FormattedMessage {...modalmsg.title} /></ModalHeader>
      <ModalBody>
        <p><FormattedMessage {...modalmsg.confirmationMessage1} /></p>
        <p><FormattedMessage {...modalmsg.confirmationMessage2} /></p>
        <p><FormattedMessage {...modalmsg.confirmationMessage3} /></p>
        <Input placeholder={intl.formatMessage(modalmsg.placeHolder)} onChange={onChangeHandler} />
        <br />
        <Alerts errors={alerts} />
      </ModalBody>
      <ModalFooter>
        <ActionButton isActing={isActing} color="danger" action={deleteUser} message={modalmsg.delete} disabled={isDeleteButtonDisabled} />
        <Button color="secondary" onClick={cancel}><FormattedMessage {...modalmsg.cancel} /></Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteUserModal;
