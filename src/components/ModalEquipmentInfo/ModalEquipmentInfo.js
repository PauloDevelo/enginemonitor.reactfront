import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import equipmentInfoMsg from "../EquipmentInfo/EquipmentInfo.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModalEquipmentInfo = ({onEquipmentInfoSaved, visible, toggle, className, data}) => {
	const [alerts, setAlerts] = useState(undefined);
	
	const cancel = () => {
		setAlerts(undefined);
		toggle();
	}

	const handleSubmit = async(data) => {
		try{
			const equipment = await EquipmentMonitorService.createOrSaveEquipment(data);
			onEquipmentInfoSaved(equipment);
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	}

	let isCreation = data === undefined || data._id === undefined;

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}>
					<FontAwesomeIcon icon={isCreation? faPlusSquare : faEdit} />{' '}
					{!isCreation && <FormattedMessage {...equipmentInfoMsg.modalTitle} />}
					{isCreation && <FormattedMessage {...equipmentInfoMsg.modalCreationTitle} />}
				</ModalHeader>
				<ModalBody>
					{visible && <MyForm submit={handleSubmit} id="formEquipmentInfo" initialData={data}>
						<MyInput name="name" 				label={equipmentInfoMsg.name} 			type="text" 	required/>
						<MyInput name="brand" 		label={equipmentInfoMsg.brand} 			type="text" 	required/>
						<MyInput name="model" 		label={equipmentInfoMsg.model} 			type="text" 	required/>
						<MyInput name="installation" 	label={equipmentInfoMsg.installDateLabel} 	type="date" 	required/>
						<MyInput name="age" 			label={equipmentInfoMsg.age} 		type="number" 	required min={0} />
					</MyForm>}
					<Alerts errors={alerts}/>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEquipmentInfo" color="success">
						{!isCreation && <FormattedMessage {...equipmentInfoMsg.save} />}
						{isCreation && <FormattedMessage {...equipmentInfoMsg.create} />}
					</Button>
					<Button color="secondary" onClick={cancel}><FormattedMessage {...equipmentInfoMsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalEquipmentInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	onEquipmentInfoSaved: PropTypes.func.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalEquipmentInfo;