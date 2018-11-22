import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import engineinfomsg from "./EngineInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEngineIno extends React.Component {
  constructor(props) {
    super(props);
		
		this.state = {
			brand: '',
			model: '',
			age: 0,
			installation: Date.now()
		}
		
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setDefaultState = this.setDefaultState.bind(this);
  }
	
	setDefaultState(newProps) {
		this.setState(function(prevState, props){
				return {
					brand: newProps.brand,
					model: newProps.model,
					age: newProps.age,
					installation: newProps.installation.toISOString().substr(0, 10)
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

		currentState.installation = Date.parse(currentState.installation);
		
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
				<ModalHeader toggle={this.props.toggle}><FormattedMessage {...engineinfomsg.modalTitle} /></ModalHeader>
				<ModalBody>
					<MyForm submit={this.handleSubmit} id="formEngineInfo">
						<MyInput name="brand" 				label={engineinfomsg.brand} 						type="text" 	value={this.state.brand} 				handleChange={this.handleChange} required/>
						<MyInput name="model" 				label={engineinfomsg.model} 						type="text" 	value={this.state.model} 				handleChange={this.handleChange} required/>
						<MyInput name="installation" 	label={engineinfomsg.installDateLabel} 	type="date" 	value={this.state.installation} handleChange={this.handleChange} required/>
						<MyInput name="age" 					label={engineinfomsg.engineAge} 				type="number" value={this.state.age} 					handleChange={this.handleChange} required min="0" />
					</MyForm>
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEngineInfo" color="success"><FormattedMessage {...engineinfomsg.save} /></Button>
					<Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...engineinfomsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
    );
  }
}

export default ModalEngineIno;