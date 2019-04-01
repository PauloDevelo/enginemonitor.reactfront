import React, { Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { CSSTransition } from 'react-transition-group'
import PropTypes from 'prop-types';

import { useEditModalLogic } from '../../hooks/EditModalLogicHook';

import editTaskMsg from "./ModalEditTask.messages";

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"


import '../../style/transition.css';
import { Equipment, Task } from '../../types/Types';

type Props = {
	equipment: Equipment, 
	task: Task, 
	onTaskSaved: (task: Task) => void, 
	toggle: () => void, 
	onTaskDeleted?: (task: Task)=> void, 
	visible: boolean, 
	className?: string 
}

const ModalEditTask = ({equipment, task, onTaskSaved, toggle, onTaskDeleted, visible, className}: Props) => {
	const onSaveTask = (task: Task): void => {
		task.usagePeriodInHour = task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0 ? -1 : task.usagePeriodInHour;
	}

	const equipmentId = equipment === undefined ? undefined : equipment._id;
	const taskId = task === undefined ? undefined : task._id;

	const modalLogic = useEditModalLogic(toggle, EquipmentMonitorService.createOrSaveTask, [equipmentId], onSaveTask, onTaskSaved, 
												 EquipmentMonitorService.deleteTask, [equipmentId, taskId], onTaskDeleted);

	let title = undefined;
	if (task === undefined || task._id === undefined){
		title = <FormattedMessage {...editTaskMsg.modalCreationTaskTitle} />
	}
	else{
		title = <FormattedMessage {...editTaskMsg.modalEditTaskTitle} />
	}

	return (
		<Fragment>
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
					<ModalHeader toggle={modalLogic.cancel}><FontAwesomeIcon icon={faEdit} />{' '}{title}</ModalHeader>
					<ModalBody>
						{visible && <MyForm id="createTaskForm" submit={modalLogic.handleSubmit} initialData={task}>
							<MyInput name="name" 				label={editTaskMsg.name} 				type="text" 	required/>
							<MyInput name="usagePeriodInHour" 	label={editTaskMsg.usagePeriodInHour} 	type="number" 	min={0} />
							<MyInput name="periodInMonth" 		label={editTaskMsg.month} 				type="number" 	min={1} required/>
							<MyInput name="description" 		label={editTaskMsg.description} 		type="textarea" required />
						</MyForm>}
						<Alerts errors={modalLogic.alerts}/>
					</ModalBody>
					<ModalFooter>
						<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...editTaskMsg.save} /></Button>
						<Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...editTaskMsg.cancel} /></Button>
						{task && task._id && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...editTaskMsg.delete} /></Button>}
					</ModalFooter>
				</Modal>
			</CSSTransition>
			<ModalYesNoConfirmation visible={modalLogic.yesNoModalVisibility}
									toggle={modalLogic.toggleModalYesNoConfirmation}
									yes={modalLogic.yesDelete}
									no={modalLogic.toggleModalYesNoConfirmation}
									title={editTaskMsg.taskDeleteTitle}
									message={editTaskMsg.taskDeleteMsg} 
									className='modal-dialog-centered'/>
		</Fragment>
	);
}

ModalEditTask.propTypes = {
	equipment: PropTypes.object,
	task: PropTypes.object,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	onTaskSaved: PropTypes.func.isRequired,
	onTaskDeleted: PropTypes.func,
	className: PropTypes.string
};

export default ModalEditTask;