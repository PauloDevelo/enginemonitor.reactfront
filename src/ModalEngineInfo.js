import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

import './transition.css';

const ModalEngineInfo = ({saveBoatInfo, visible, toggle, className, data}) => {
	const handleSubmit = (data) => {
		saveBoatInfo(data);
		toggle();
	}

	let isCreation = data === undefined || data._id === undefined;

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
				<ModalHeader toggle={toggle}>
					<FontAwesomeIcon icon={isCreation? faPlusSquare : faEdit} />{' '}
					{!isCreation && <FormattedMessage {...engineinfomsg.modalTitle} />}
					{isCreation && <FormattedMessage {...engineinfomsg.modalCreationTitle} />}
				</ModalHeader>
				<ModalBody>
				{visible && <MyForm submit={handleSubmit} id="formEngineInfo" initialData={data}>
						<MyInput name="name" 				label={engineinfomsg.name} 			type="text" 	required/>
						<MyInput name="engineBrand" 		label={engineinfomsg.brand} 			type="text" 	required/>
						<MyInput name="engineModel" 		label={engineinfomsg.model} 			type="text" 	required/>
						<MyInput name="engineInstallation" 	label={engineinfomsg.installDateLabel} 	type="date" 	required/>
						<MyInput name="engineAge" 			label={engineinfomsg.engineAge} 		type="number" 	required min={0} />
					</MyForm>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEngineInfo" color="success">
						{!isCreation && <FormattedMessage {...engineinfomsg.save} />}
						{isCreation && <FormattedMessage {...engineinfomsg.create} />}
					</Button>
					<Button color="secondary" onClick={toggle}><FormattedMessage {...engineinfomsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalEngineInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveBoatInfo: PropTypes.func.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalEngineInfo;