import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import PropTypes from 'prop-types';

import edittaskmsg from "./ModalEditTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEditTask extends React.Component {
  constructor(props) {
    super(props);
		
	this.state = {
		name: '',
		engineHours: '',
		month: '',
		description: '',
		
		prevprops: { visible: false }
	}
	
	this.handleChange = this.handleChange.bind(this);
	this.handleSubmit = this.handleSubmit.bind(this);
	this.setDefaultState = this.setDefaultState.bind(this);
  }
	
	setDefaultState(newProps) {
		if (newProps.name !== undefined){
			this.setState(function(prevState, props){
				return {
					name: newProps.name,
					engineHours: newProps.engineHours,
					month: newProps.month,
					description: newProps.description,
					
					prevprops: { visible: newProps.visible }
				};
			});
		}
	}
	
	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible === false && nextProps.visible === true){
			var newTask = undefined;
			if(nextProps.task){
				newTask = {
					id: nextProps.task.id,
					name: nextProps.task.name,
					engineHours: nextProps.task.engineHours <= 0 ? 0 : nextProps.task.engineHours,
					month: nextProps.task.month,
					description: nextProps.task.description
				};
			}
			else{
				newTask = {
					id: undefined,
					name: '',
					engineHours: '',
					month: '',
					description: ''
				};
			}

			newTask.prevprops = { visible: nextProps.visible }

			return newTask;
		}
		else if(prevState.prevprops.visible === true && nextProps.visible === false){
			return {
				prevprops: {visible: nextProps.visible}
			}
		}
		else{
			return null;
		}
	}
	
	handleSubmit(event) {
		var currentState = Object.assign({}, this.state);
		currentState.engineHours = currentState.engineHours <= 0 || currentState.engineHours === undefined ? -1 :currentState.engineHours;

		this.props.save(currentState);
  	}

	handleChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		
		this.setState(function(prevState, props){
			return { [name]: value }
		});
		
		if(this.state[name] === undefined){
			console.log('The property ' + name + ' is not defined in the state:');
			console.log(this.state);
		}
	}

  render() {
	var title = undefined;
	if (this.props.task === undefined){
		title = <FormattedMessage {...edittaskmsg.modalCreationTaskTitle} />
	}
	else{
		title = <FormattedMessage {...edittaskmsg.modalEditTaskTitle} />
	}

    return (
		<Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
			<ModalHeader toggle={this.props.toggle}>{title}</ModalHeader>
			<ModalBody>
				<MyForm submit={this.handleSubmit} id="createTaskForm">
					<MyInput name="name" 		label={edittaskmsg.name} 		type="text" 	value={this.state.name} 		handleChange={this.handleChange} required/>
					<MyInput name="engineHours" label={edittaskmsg.engineHours} type="number" 	value={this.state.engineHours} 	handleChange={this.handleChange} min={0} />
					<MyInput name="month" 		label={edittaskmsg.month} 		type="number" 	value={this.state.month} 		handleChange={this.handleChange} min={1} required/>
					<MyInput name="description" label={edittaskmsg.description} type="textarea" value={this.state.description} 	handleChange={this.handleChange} required />
				</MyForm>
			</ModalBody>
			<ModalFooter>
				<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...edittaskmsg.save} /></Button>
				<Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...edittaskmsg.cancel} /></Button>
				{this.props.task && <Button color="danger" onClick={this.props.delete}><FormattedMessage {...edittaskmsg.delete} /></Button>}
			</ModalFooter>
		</Modal>
    );
  }
}

ModalEditTask.propTypes = {
	task: PropTypes.object,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	delete: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditTask;