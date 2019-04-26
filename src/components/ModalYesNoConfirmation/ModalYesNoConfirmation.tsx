import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import '../../style/transition.css';

import jsonMessages from "./ModalYesNoConfirmation.messages.json";
const modalmsg: Messages = defineMessages(jsonMessages);

type Props = {
    yes: ()=>void, 
    no?: ()=>void, 
    visible: boolean, 
    className: string, 
    title: FormattedMessage.MessageDescriptor, 
    message: FormattedMessage.MessageDescriptor, 
    toggle: () => void
}

const ModalYesNoConfimation = ({yes, no, visible, className, title, message, toggle}: Props) => {
    return(
        <CSSTransition in={visible} timeout={300} classNames="modal">
            <Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
                <ModalHeader toggle={toggle}><FormattedMessage {...title} /></ModalHeader>
                <ModalBody>
                    {message && <FormattedMessage {...message} />}
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={yes}><FormattedMessage {...modalmsg.yes} /></Button>
                    <Button color="secondary" onClick={no}><FormattedMessage {...modalmsg.no} /></Button>
                </ModalFooter>
            </Modal>
        </CSSTransition>
    );
}

ModalYesNoConfimation.propTypes = {
	yes: PropTypes.func.isRequired,
	no: PropTypes.func,
	visible: PropTypes.bool.isRequired,
	className: PropTypes.string,
	title: PropTypes.object.isRequired,
    message: PropTypes.object,
    toggle: PropTypes.func.isRequired,
};

export default ModalYesNoConfimation;