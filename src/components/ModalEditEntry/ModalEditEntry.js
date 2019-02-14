import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group'

import editentrymsg from "./ModalEditEntry.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModalEditEntry = ({ entry, visible, toggle, className, saveEntry, deleteEntry }) => {
	const [alerts, setAlerts] = useState(undefined);

	const cancel = () => {
		setAlerts(undefined);
		toggle();
	}

	const handleSubmit = async (formData) => {
		try{
			await saveEntry(formData);
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			console.log(error);
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	};
	
	const handleDelete = () => {
		try{
			deleteEntry(entry._id, toggle);
			setAlerts(undefined);
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	}

	let title = undefined;
	if (entry._id === undefined){
		title = <FormattedMessage {...editentrymsg.modalAckTitle} />
	}
	else{
		title = <FormattedMessage {...editentrymsg.modalEditEntryTitle} />
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
						<MyInput name="name" 	label={editentrymsg.name} 	    type="text" 	required/>
						<MyInput name="date" label={editentrymsg.date}       type="date" 	required/>
						<MyInput name="age" 	label={editentrymsg.age} 	type="number" 	min={0} required/>
						<MyInput name="remarks" label={editentrymsg.remarks}    type="textarea" required />
					</MyForm>}
					<Alerts errors={alerts}/>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...editentrymsg.save} /></Button>
					<Button color="secondary" onClick={cancel}><FormattedMessage {...editentrymsg.cancel} /></Button>
					{entry._id && <Button color="danger" onClick={handleDelete}><FormattedMessage {...editentrymsg.delete} /></Button>}
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalEditEntry.propTypes = {
	entry: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveEntry: PropTypes.func.isRequired,
	deleteEntry: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditEntry;