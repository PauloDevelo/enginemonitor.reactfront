import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group'

import editEntryMsg from "./ModalEditEntry.messages";

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import HttpError from '../../http/HttpError'

const ModalEditEntry = ({ equipment, task, entry, visible, className, saveEntry, deleteEntry, toggle }) => {
	const [alerts, setAlerts] = useState(undefined);
	const [yesNoModalVisibility, setYesNoModalVisibility] = useState(false);

	const toggleModalYesNoConfirmation = () => {
		setYesNoModalVisibility(!yesNoModalVisibility);
	}

	const cancel = () => {
		setAlerts(undefined);
		toggle();
	}

	const handleSubmit = async (formData) => {
		try{
			const savedEntry = await EquipmentMonitorService.createOrSaveEntry(equipment._id, task._id, formData);
            
			saveEntry(savedEntry);
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	};
	
	const handleDelete = () => {
		setYesNoModalVisibility(true);
	}

	const yesDeleteEntry = async () => {
		try{
			await EquipmentMonitorService.deleteEntry(equipment._id, task._id, entry._id);
			deleteEntry(entry._id);
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
		toggleModalYesNoConfirmation();
	}

	let title = undefined;
	if (entry === undefined || entry._id === undefined){
		title = <FormattedMessage {...editEntryMsg.modalAckTitle} />
	}
	else{
		title = <FormattedMessage {...editEntryMsg.modalEditEntryTitle} />
	}

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faCheckSquare} size="lg"/>{' '}{title}</ModalHeader>
				<ModalBody>
					{visible && 
					<MyForm id="createTaskForm" 
						submit={handleSubmit} 
						initialData={entry}>
						<MyInput name="name" 	label={editEntryMsg.name} 	    type="text" 	required/>
						<MyInput name="date" label={editEntryMsg.date}       type="date" 	required/>
						<MyInput name="age" 	label={editEntryMsg.age} 	type="number" 	min={0} required/>
						<MyInput name="remarks" label={editEntryMsg.remarks}    type="textarea" required />
					</MyForm>}
					<Alerts errors={alerts}/>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...editEntryMsg.save} /></Button>
					<Button color="secondary" onClick={cancel}><FormattedMessage {...editEntryMsg.cancel} /></Button>
					{entry && entry._id && <Button color="danger" onClick={handleDelete}><FormattedMessage {...editEntryMsg.delete} /></Button>}
				</ModalFooter>
				<ModalYesNoConfirmation visible={yesNoModalVisibility}
						toggle={toggleModalYesNoConfirmation}
						yes={yesDeleteEntry}
						no={toggleModalYesNoConfirmation}
						title={editEntryMsg.entryDeleteTitle}
						message={editEntryMsg.entryDeleteMsg} 
						className='modal-dialog-centered'
					/>
			</Modal>
		</CSSTransition>
	);
}

ModalEditEntry.propTypes = {
	equipment: PropTypes.object,
	task: PropTypes.object,
	entry: PropTypes.object,
	visible: PropTypes.bool.isRequired,
	saveEntry: PropTypes.func.isRequired,
	deleteEntry: PropTypes.func.isRequired,
	className: PropTypes.string,
	toggle: PropTypes.func
};

export default ModalEditEntry;