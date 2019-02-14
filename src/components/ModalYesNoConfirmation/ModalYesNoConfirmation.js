import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import '../../style/transition.css';

import modalmsg from "./ModalYesNoConfirmation.messages";

const ModalYesNoConfimation = ({yes, no, visible, className, title, message, toggle}) => {
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