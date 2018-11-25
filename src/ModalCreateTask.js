import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import createtaskmsg from "./ModalCreateTask.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEngineIno extends React.Component {
  constructor(props) {
    super(props);
		
		this.state = {
			name: '',
			engineHours: 0,
			month: 0,
			description: ''
		}
		
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setDefaultState = this.setDefaultState.bind(this);
  }
	
	setDefaultState(newProps) {
		this.setState(function(prevState, props){
				return {
					name: newProps.name,
					engineHours: newProps.engineHours,
					month: newProps.month,
					description: newProps.description
				};
		});
	}
	
	componentWillReceiveProps(nextProps) {
			this.setDefaultState(nextProps);
	}
	
	componentWillMount() {
		if (this.props.brand) this.setDefaultState(this.prop);
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
  }

  render() {
    return (
			<Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
				<ModalHeader toggle={this.props.toggle}><FormattedMessage {...createtaskmsg.modalCreateTaskTitle} /></ModalHeader>
				<ModalBody>
					<MyForm submit={this.handleSubmit} id="createTaskForm">
						<MyInput name="name" 				label={createtaskmsg.name} 				type="text" 	value={this.state.name} 				handleChange={this.handleChange} required/>
						<MyInput name="engineHours" label={createtaskmsg.engineHours} type="number" value={this.state.engineHours} 	handleChange={this.handleChange} min={'0'} />
						<MyInput name="month" 			label={createtaskmsg.month} 			type="number" value={this.state.month} 				handleChange={this.handleChange} min={'0'} required/>
						<MyInput name="description" label={createtaskmsg.description} type="text" 	value={this.state.description} 	handleChange={this.handleChange} required />
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

export default ModalEngineIno;