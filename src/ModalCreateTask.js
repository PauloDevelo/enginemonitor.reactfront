import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import PropTypes from 'prop-types';

import createtaskmsg from "./ModalCreateTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalCreateTask extends React.Component {
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
			var newTask = {
				name: '',
				engineHours: '',
				month: '',
				description: '',

				prevprops: { visible: nextProps.visible }
			};
			
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
    return (
		<Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
			<ModalHeader toggle={this.props.toggle}><FormattedMessage {...createtaskmsg.modalCreateTaskTitle} /></ModalHeader>
			<ModalBody>
				<MyForm submit={this.handleSubmit} id="createTaskForm">
					<MyInput name="name" 		label={createtaskmsg.name} 			type="text" 	value={this.state.name} 		handleChange={this.handleChange} required/>
					<MyInput name="engineHours" label={createtaskmsg.engineHours} 	type="number" 	value={this.state.engineHours} 	handleChange={this.handleChange} min={0} />
					<MyInput name="month" 		label={createtaskmsg.month} 		type="number" 	value={this.state.month} 		handleChange={this.handleChange} min={1} required/>
					<MyInput name="description" label={createtaskmsg.description} 	type="text" 	value={this.state.description} 	handleChange={this.handleChange} required />
				</MyForm>
			</ModalBody>
			<ModalFooter>
				<Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...createtaskmsg.save} /></Button>
				<Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...createtaskmsg.cancel} /></Button>
			</ModalFooter>
		</Modal>
    );
  }
}

ModalCreateTask.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	className: PropTypes.string,

};

export default ModalCreateTask;