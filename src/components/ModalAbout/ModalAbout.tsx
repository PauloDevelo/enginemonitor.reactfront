import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, Media } from 'reactstrap';

import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import appVersion from '../../global';

import jsonMessages from "./ModalAbout.messages.json";
const aboutMsg: Messages = defineMessages(jsonMessages);

type Props = {
	visible: boolean, 
	className?: string, 
	toggle: ()=>void
}

const ModalAbout = ({ visible, className, toggle }: Props) => {
	return (
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
					<ModalHeader toggle={toggle}>
                        <Media left>
                            <Media object src="./images/engine48.png" alt="Equipment Maintenance icon" />
                        </Media>
                        <Media body>
                            <Media heading>
                                <FormattedMessage {...aboutMsg.title} />&nbsp;v{appVersion}
                            </Media>
                            Made with love by Paul Torruella
                        </Media>
					</ModalHeader>
					<ModalBody>
						{visible && <Form id="aboutForm">
						</Form>}
					</ModalBody>
					<ModalFooter>
						<Button type="submit" form="aboutForm" color="success" onClick={toggle}><FormattedMessage {...aboutMsg.ok} /></Button>
					</ModalFooter>
				</Modal>
			</CSSTransition>
	);
}

ModalAbout.propTypes = {
	visible: PropTypes.bool.isRequired,
	className: PropTypes.string,
	toggle: PropTypes.func.isRequired
};

export default ModalAbout;