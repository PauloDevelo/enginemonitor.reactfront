import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { CSSTransition } from 'react-transition-group'
import PropTypes from 'prop-types';

import edittaskmsg from "./ModalEditTask.messages";

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModalEditTask = ({task, saveTask, toggle, deleteTask, visible, className}) => {
	const [alerts, setAlerts] = useState(undefined);
	const [yesNoModalVisibility, setYesNoModalVisibility] = useState(false);

	const toggleModalYesNoConfirmation = () => {
		setYesNoModalVisibility(!yesNoModalVisibility);
	}

	const cancel = () => {
		setAlerts(undefined);
		toggle();
	}

	const handleSubmit = async(data) => {
		data.usagePeriodInHour = data.usagePeriodInHour === undefined || data.usagePeriodInHour <= 0 ? -1 : data.usagePeriodInHour;
		try{
			await saveTask(data);
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	}
	
	const handleDelete = () => {
		setYesNoModalVisibility(true);
	}

	const yesDeleteTask = () => {
		try{
			deleteTask();
			setAlerts(undefined);
			toggle();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
			}
		}
	}

	let title = undefined;
	if (task === undefined || task._id === undefined){
		title = <FormattedMessage {...edittaskmsg.modalCreationTaskTitle} />
	}
	else{
		title = <FormattedMessage {...edittaskmsg.modalEditTaskTitle} />
	}

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faEdit} />{' '}{title}</ModalHeader>
				<ModalBody>
					{visible && <MyForm id="createTaskForm" submit={handleSubmit} initialData={task}>
						<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	required/>
						<MyInput name="usagePeriodInHour" label={edittaskmsg.usagePeriodInHour} type="number" 	min={0} />
						<MyInput name="periodInMonth" 		label={edittaskmsg.month} 		type="number" 	min={1} required/>
						<MyInput name="description" label={edittaskmsg.description} type="textarea" required />
					</MyForm>}
					<Alerts errors={alerts}/>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
					<Button color="secondary" onClick={cancel}><FormattedMessage {...edittaskmsg.cancel} /></Button>
					{task && task._id && <Button color="danger" onClick={handleDelete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
				</ModalFooter>
				<ModalYesNoConfirmation visible={yesNoModalVisibility}
						toggle={toggleModalYesNoConfirmation}
						yes={yesDeleteTask}
						no={toggleModalYesNoConfirmation}
						title={edittaskmsg.taskDeleteTitle}
						message={edittaskmsg.taskDeleteMsg} 
						className='modal-dialog-centered'
					/>
			</Modal>
		</CSSTransition>
	);
}

ModalEditTask.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveTask: PropTypes.func.isRequired,
	deleteTask: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditTask;