/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, CardText,
} from 'reactstrap';

import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FormattedMessage, defineMessages } from 'react-intl';

import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import HttpError from '../../http/HttpError';

import assetProxy from '../../services/AssetProxy';

import { AssetModel } from '../../types/Types';

import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';

import '../../style/transition.css';

import jsonMessages from './ModalSendInvitation.messages.json';

const sendInvitationMsg = defineMessages(jsonMessages);

enum SendingState {
  Started = 1,
  IsSending = 2,
  InError = 3,
  Sent = 4,
}

type StateType = {
  state: SendingState,
  infoMsg?: string,
  errors?: any
}

type Invitation = {
  email: string
}

type Props = {
asset: AssetModel,
visible: boolean,
toggle: () => void,
className?: string,
}

const ModalSendInvitation = ({
  asset, visible, toggle, className,
}: Props) => {
  const [state, setState] = useState<StateType>({ state: SendingState.Started });
  const [invitation, setInvitation] = useState<Invitation>({ email: '' });

  const cancel = () => {
    toggle();
  };

  const sendInvitationEmail = async (newInvitation: Invitation) => {
    const currentInvitation = { ...newInvitation };

    setState({ state: SendingState.IsSending });
    setInvitation(currentInvitation);

    try {
      await assetProxy.sendOwnershipInvitation(asset, currentInvitation.email);
      setState({ state: SendingState.Started, infoMsg: 'invitationSent' });
      setTimeout(toggle, 3000);
    } catch (errors) {
      if (errors instanceof HttpError) {
        setState({ state: SendingState.InError, errors: errors.data });
      } else {
        setState({ state: SendingState.InError, errors: errors.message });
      }
    }
  };

  return (
    <>
      <Modal isOpen={visible && state.state !== SendingState.Sent} className={className} fade>
        <ModalHeader toggle={toggle}>
          <FontAwesomeIcon icon={faEnvelopeOpen} />
          {' '}
          <FormattedMessage {...sendInvitationMsg.modaltitle} />
        </ModalHeader>
        <ModalBody>
          {visible && (
            <>
              <FormattedMessage {...sendInvitationMsg.preambule} />
              <br />
              <br />
              <MyForm submit={sendInvitationEmail} id="formSendInvitation" initialData={invitation}>
                <MyInput name="email" label={sendInvitationMsg.email} type="email" required />
                {true}
              </MyForm>
            </>
          )}
          {state.infoMsg && <Alerts error={state.infoMsg} color="success" />}
          {state.errors && <Alerts errors={state.errors} />}
        </ModalBody>
        <ModalFooter className="without-horizontal-bar">
          <ActionButton type="submit" form="formSendInvitation" color="success" className="d-block mx-auto" message={sendInvitationMsg.sendInvitation} isActing={state.state === SendingState.IsSending} />
          <Button color="secondary" onClick={cancel}><FormattedMessage {...sendInvitationMsg.cancel} /></Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

ModalSendInvitation.defaultProps = {
  className: undefined,
};

export default ModalSendInvitation;
