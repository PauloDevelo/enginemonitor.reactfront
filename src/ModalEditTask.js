import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import edittaskmsg from "./ModalEditTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

const ModalEditTask = ({task, saveTask, toggle, deleteTask, visible, className}) => {
	const handleSubmit = (data) => {
		data.engineHours = data.engineHours <= 0 || data.engineHours === undefined ? -1 :data.engineHours;
		saveTask(data);
		toggle();
	}
	
	const handleDelete = () => {
		deleteTask(toggle);
	}

	let title = undefined;
	if (task.id === undefined){
		title = <FormattedMessage {...edittaskmsg.modalCreationTaskTitle} />
	}
	else{
		title = <FormattedMessage {...edittaskmsg.modalEditTaskTitle} />
	}

	return (
		<Modal isOpen={visible} toggle={toggle} className={className}>
			<ModalHeader toggle={toggle}>{title}</ModalHeader>
			<ModalBody>
				{visible && <MyForm id="createTaskForm" submit={handleSubmit} initialData={task}>
					<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	required/>
					<MyInput name="engineHours" label={edittaskmsg.engineHours} type="number" 	min={0} />
					<MyInput name="month" 		label={edittaskmsg.month} 		type="number" 	min={1} required/>
					<MyInput name="description" label={edittaskmsg.description} type="textarea" required />
				</MyForm>}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
				<Button color="secondary" onClick={toggle}><FormattedMessage {...edittaskmsg.cancel} /></Button>
				{task.id && <Button color="danger" onClick={handleDelete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
			</ModalFooter>
		</Modal>
	);
}

ModalEditTask.propTypes = {
	task: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveTask: PropTypes.func.isRequired,
	deleteTask: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditTask;