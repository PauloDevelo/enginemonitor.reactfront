import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import equipmentinfomsg from "./EquipmentInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

import './transition.css';

const ModalEquipmentInfo = ({saveEquipmentInfo, visible, toggle, className, data}) => {
	const handleSubmit = async(data) => {
		try{
			await saveEquipmentInfo(data);
			toggle();
		}
		catch(error){

		}
	}

	let isCreation = data === undefined || data._id === undefined;

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
				<ModalHeader toggle={toggle}>
					<FontAwesomeIcon icon={isCreation? faPlusSquare : faEdit} />{' '}
					{!isCreation && <FormattedMessage {...equipmentinfomsg.modalTitle} />}
					{isCreation && <FormattedMessage {...equipmentinfomsg.modalCreationTitle} />}
				</ModalHeader>
				<ModalBody>
				{visible && <MyForm submit={handleSubmit} id="formEquipmentInfo" initialData={data}>
						<MyInput name="name" 				label={equipmentinfomsg.name} 			type="text" 	required/>
						<MyInput name="brand" 		label={equipmentinfomsg.brand} 			type="text" 	required/>
						<MyInput name="model" 		label={equipmentinfomsg.model} 			type="text" 	required/>
						<MyInput name="installation" 	label={equipmentinfomsg.installDateLabel} 	type="date" 	required/>
						<MyInput name="age" 			label={equipmentinfomsg.age} 		type="number" 	required min={0} />
					</MyForm>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEquipmentInfo" color="success">
						{!isCreation && <FormattedMessage {...equipmentinfomsg.save} />}
						{isCreation && <FormattedMessage {...equipmentinfomsg.create} />}
					</Button>
					<Button color="secondary" onClick={toggle}><FormattedMessage {...equipmentinfomsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalEquipmentInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveEquipmentInfo: PropTypes.func.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalEquipmentInfo;