import React, { Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { CSSTransition } from 'react-transition-group'
import PropTypes from 'prop-types';

import { useEditModalLogic } from '../../hooks/EditModalLogicHook';

import edittaskmsg from "./ModalEditTask.messages";

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"


import '../../style/transition.css';

const ModalEditTask = ({equipment, task, onTaskSaved, toggle, onTaskDeleted, visible, className}) => {
	const onSaveTask = (task) => {
		task.usagePeriodInHour = task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0 ? -1 : task.usagePeriodInHour;
	}

	const equipmentId = equipment === undefined ? undefined : equipment._id;
	const taskId = task === undefined ? undefined : task._id;

	const modalLogic = useEditModalLogic(toggle, EquipmentMonitorService.createOrSaveTask, [equipmentId], onSaveTask, onTaskSaved, 
												 EquipmentMonitorService.deleteTask, [equipmentId, taskId], onTaskDeleted);

	let title = undefined;
	if (task === undefined || task._id === undefined){
		title = <FormattedMessage {...edittaskmsg.modalCreationTaskTitle} />
	}
	else{
		title = <FormattedMessage {...edittaskmsg.modalEditTaskTitle} />
	}

	return (
		<Fragment>
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
					<ModalHeader toggle={modalLogic.cancel}><FontAwesomeIcon icon={faEdit} />{' '}{title}</ModalHeader>
					<ModalBody>
						{visible && <MyForm id="createTaskForm" submit={modalLogic.handleSubmit} initialData={task}>
							<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	required/>
							<MyInput name="usagePeriodInHour" label={edittaskmsg.usagePeriodInHour} type="number" 	min={0} />
							<MyInput name="periodInMonth" 		label={edittaskmsg.month} 		type="number" 	min={1} required/>
							<MyInput name="description" label={edittaskmsg.description} type="textarea" required />
						</MyForm>}
						<Alerts errors={modalLogic.alerts}/>
					</ModalBody>
					<ModalFooter>
						<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
						<Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...edittaskmsg.cancel} /></Button>
						{task && task._id && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
					</ModalFooter>
					
				</Modal>
			</CSSTransition>
			<ModalYesNoConfirmation visible={modalLogic.yesNoModalVisibility}
									toggle={modalLogic.toggleModalYesNoConfirmation}
									yes={modalLogic.yesDelete}
									no={modalLogic.toggleModalYesNoConfirmation}
									title={edittaskmsg.taskDeleteTitle}
									message={edittaskmsg.taskDeleteMsg} 
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