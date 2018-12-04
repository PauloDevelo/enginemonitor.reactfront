import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import edittaskmsg from "./ModalEditTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEditTask extends React.Component {
	constructor(props) {
		super(props);
			
		this.state = {
			prevprops: { visible: false }
		}
	}

	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible !== nextProps.visible){
			return {
				prevprops: {visible: nextProps.visible}
			}
		}
		else{
			return null;
		}
	}

	handleSubmit = (data) => {
		data.engineHours = data.engineHours <= 0 || data.engineHours === undefined ? -1 :data.engineHours;

		this.props.save(data);
		this.props.toggle();
	}
	
	delete = () => {
		this.props.delete();
		this.props.toggle();
	}

	render() {
		var title = undefined;
		if (this.props.task.id === undefined){
			title = <FormattedMessage {...edittaskmsg.modalCreationTaskTitle} />
		}
		else{
			title = <FormattedMessage {...edittaskmsg.modalEditTaskTitle} />
		}

		return (
			<Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
				<ModalHeader toggle={this.props.toggle}>{title}</ModalHeader>
				<ModalBody>
					{this.props.visible && <MyForm id="createTaskForm" submit={this.handleSubmit} initialData={this.props.task}>
						<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	required/>
						<MyInput name="engineHours" label={edittaskmsg.engineHours} type="number" 	min={0} />
						<MyInput name="month" 		label={edittaskmsg.month} 		type="number" 	min={1} required/>
						<MyInput name="description" label={edittaskmsg.description} type="textarea" required />
					</MyForm>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
					<Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...edittaskmsg.cancel} /></Button>
					{this.props.task.id && <Button color="danger" onClick={this.delete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
				</ModalFooter>
			</Modal>
		);
	}
}

ModalEditTask.propTypes = {
	task: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	delete: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditTask;