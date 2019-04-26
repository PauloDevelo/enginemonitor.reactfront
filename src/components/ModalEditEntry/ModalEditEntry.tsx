import React, { Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group'

import { useEditModalLogic } from '../../hooks/EditModalLogicHook';

import jsonMessages from "./ModalEditEntry.messages.json";
const editEntryMsg: Messages = defineMessages(jsonMessages);

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import { Equipment, Task, Entry, AgeAcquisitionType } from '../../types/Types';

type Props = {
	equipment: Equipment, 
	task: Task, 
	entry: Entry, 
	visible: boolean, 
	className?: string, 
	saveEntry: (entry: Entry) => void, 
	deleteEntry?: (entry: Entry) => void, 
	toggle: ()=>void
}

const ModalTitle = ({entry}:{entry: Entry}) => {
	if (entry._id === undefined){
		return <FormattedMessage {...editEntryMsg.modalAckTitle} />;
	}
	else{
		return <FormattedMessage {...editEntryMsg.modalEditEntryTitle} />;
	}
}

const ModalEditEntry = ({ equipment, task, entry, visible, className, saveEntry, deleteEntry, toggle }: Props) => {
	const equipmentId = equipment === undefined ? undefined : equipment._id;
	const taskId = task === undefined ? undefined : task._id;
	const entryId = entry === undefined ? undefined : entry._id;

	const modalLogic = useEditModalLogic<Entry>(toggle, EquipmentMonitorService.createOrSaveEntry, [equipmentId, taskId], undefined, saveEntry, 
												 EquipmentMonitorService.deleteEntry, [equipmentId, taskId, entryId], deleteEntry);

	return (
		<Fragment>
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
					<ModalHeader toggle={modalLogic.cancel}><FontAwesomeIcon icon={faCheckSquare} size="lg"/>{' '}<ModalTitle entry={entry}/></ModalHeader>
					<ModalBody>
						{visible && 
						<MyForm id="createTaskForm" 
							submit={modalLogic.handleSubmit} 
							initialData={entry}>
							<MyInput name="name" 	label={editEntryMsg.name} 	    type="text" 	required/>
							<MyInput name="date" label={editEntryMsg.date}       type="date" 	required/>
							{equipment.ageAcquisitionType !== AgeAcquisitionType.time && <MyInput name="age" 	label={editEntryMsg.age} 	type="number" 	min={0} required/>}
							<MyInput name="remarks" label={editEntryMsg.remarks}    type="textarea" required />
						</MyForm>}
						<Alerts errors={modalLogic.alerts}/>
					</ModalBody>
					<ModalFooter>
						<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...editEntryMsg.save} /></Button>
						<Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...editEntryMsg.cancel} /></Button>
						{entry && entry._id && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...editEntryMsg.delete} /></Button>}
					</ModalFooter>
				</Modal>
			</CSSTransition>
			<ModalYesNoConfirmation visible={modalLogic.yesNoModalVisibility}
									toggle={modalLogic.toggleModalYesNoConfirmation}
									yes={modalLogic.yesDelete}
									no={modalLogic.toggleModalYesNoConfirmation}
									title={editEntryMsg.entryDeleteTitle}
									message={editEntryMsg.entryDeleteMsg} 
									className='modal-dialog-centered'/>
		</Fragment>
	);
}

ModalEditEntry.propTypes = {
	equipment: PropTypes.object.isRequired,
	task: PropTypes.object.isRequired,
	entry: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	saveEntry: PropTypes.func.isRequired,
	deleteEntry: PropTypes.func,
	className: PropTypes.string,
	toggle: PropTypes.func.isRequired
};

export default ModalEditEntry;