import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { CSSTransition } from 'react-transition-group';
// eslint-disable-next-line no-unused-vars
import { FormattedMessage, defineMessages, MessageDescriptor } from 'react-intl';

import '../../style/transition.css';

import jsonMessages from './ModalYesNoConfirmation.messages.json';
import ActionButton from '../ActionButton/ActionButton';

const modalmsg = defineMessages(jsonMessages);

type Props = {
    yes: ()=>void,
    isActing: boolean,
    no?: ()=>void,
    visible: boolean,
    className: string,
    title: MessageDescriptor,
    message: MessageDescriptor,
    toggle: () => void
}

const ModalYesNoConfirmation = ({
  yes, isActing, no, visible, className, title, message, toggle,
}: Props) => (
  <CSSTransition in={visible} timeout={300} classNames="modal">
    <Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
      <ModalHeader toggle={toggle}><FormattedMessage {...title} /></ModalHeader>
      <ModalBody>
        {message && <FormattedMessage {...message} />}
      </ModalBody>
      <ModalFooter>
        <ActionButton isActing={isActing} color="success" action={yes} message={modalmsg.yes} />
        <Button color="secondary" onClick={no}><FormattedMessage {...modalmsg.no} /></Button>
      </ModalFooter>
    </Modal>
  </CSSTransition>
);

export default ModalYesNoConfirmation;
