import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEngineInfo extends React.Component {
	constructor(props) {
		super(props);
			
		this.state = {
			brand: '',
			model: '',
			age: 0,
			installation: new Date().toISOString().substr(0, 10),
			
			prevprops: props
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setDefaultState = this.setDefaultState.bind(this);
	}
	
	setDefaultState(newProps) {
		var newEngineInfo = {
			brand: newProps.brand,
			model: newProps.model,
			age: newProps.age,
			installation: newProps.installation.toISOString().substr(0, 10),
			
			prevprops: newProps
		};

		this.setState(function(prevState, props){
			return newEngineInfo;
		});
	}
	
	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible === false && nextProps.visible === true){
			var newEngineInfo = {
				brand: nextProps.brand,
				model: nextProps.model,
				age: nextProps.age,
				installation: nextProps.installation.toISOString().substr(0, 10),
				
				prevprops: nextProps
			};
			
			return newEngineInfo;
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
		currentState.installation = new Date(currentState.installation);
		
		this.props.save(currentState);
		this.props.toggle();
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
					<MyInput name="brand" 			label={engineinfomsg.brand} 			type="text" 	value={this.state.brand} 		handleChange={this.handleChange} required/>
					<MyInput name="model" 			label={engineinfomsg.model} 			type="text" 	value={this.state.model} 		handleChange={this.handleChange} required/>
					<MyInput name="installation" 	label={engineinfomsg.installDateLabel} 	type="date" 	value={this.state.installation} handleChange={this.handleChange} required/>
					<MyInput name="age" 			label={engineinfomsg.engineAge} 		type="number" 	value={this.state.age} 			handleChange={this.handleChange} required min={0} />
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

ModalEngineInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	className: PropTypes.string,
	brand: PropTypes.string,
	model: PropTypes.string,
	age: PropTypes.number,
	installation: PropTypes.object
};

export default ModalEngineInfo;