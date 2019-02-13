import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import { CSSTransition } from 'react-transition-group'
import PropTypes from 'prop-types';

import edittaskmsg from "./ModalEditTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

import './transition.css';

const ModalEditTask = ({task, saveTask, toggle, deleteTask, visible, className}) => {
	const handleSubmit = (data) => {
		data.usagePeriodInHour = data.usagePeriodInHour === undefined || data.usagePeriodInHour <= 0 ? -1 : data.usagePeriodInHour;
		saveTask(data);
		toggle();
	}
	
	const handleDelete = () => {
		deleteTask(toggle);
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
			<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
				<ModalHeader toggle={toggle}><FontAwesomeIcon icon={faEdit} />{' '}{title}</ModalHeader>
				<ModalBody>
					{visible && <MyForm id="createTaskForm" submit={handleSubmit} initialData={task}>
						<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	required/>
						<MyInput name="usagePeriodInHour" label={edittaskmsg.usagePeriodInHour} type="number" 	min={0} />
						<MyInput name="periodInMonth" 		label={edittaskmsg.month} 		type="number" 	min={1} required/>
						<MyInput name="description" label={edittaskmsg.description} type="textarea" required />
					</MyForm>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
					<Button color="secondary" onClick={toggle}><FormattedMessage {...edittaskmsg.cancel} /></Button>
					{task && task._id && <Button color="danger" onClick={handleDelete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
				</ModalFooter>
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