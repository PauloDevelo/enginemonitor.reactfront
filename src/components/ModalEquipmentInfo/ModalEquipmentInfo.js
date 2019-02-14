import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import equipmentinfomsg from "../EquipmentInfo/EquipmentInfo.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModalEquipmentInfo = ({saveEquipmentInfo, visible, toggle, className, data}) => {
	const [alerts, setAlerts] = useState(undefined);
	
	const cancel = () => {
		setAlerts(undefined);
		toggle();
	}

	const handleSubmit = async(data) => {
		try{
			await saveEquipmentInfo(data);
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
					<Alerts errors={alerts}/>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEquipmentInfo" color="success">
						{!isCreation && <FormattedMessage {...equipmentinfomsg.save} />}
						{isCreation && <FormattedMessage {...equipmentinfomsg.create} />}
					</Button>
					<Button color="secondary" onClick={cancel}><FormattedMessage {...equipmentinfomsg.cancel} /></Button>
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