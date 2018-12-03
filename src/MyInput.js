import React, {Component} from 'react';

import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';

import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

class MyInput extends Component {
	
	constructor(props){
		super(props);
		
		this.state = {
			isValid: true
		}
		
		this.validate = this.validate.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
		this.setInputElem = this.setInputElem.bind(this);
	}
	
	validate(){	
		this.setState((prevState, props) => {
			return{
				isValid: this.inputElem.validity.valid,
				errorMessage: this.inputElem.validationMessage
			}
		});
	}
	
	onChangeHandler(event){
		this.validate();
		if(typeof this.props.handleChange === 'function')this.props.handleChange(event);
	}
	
	setInputElem(inputElem){
		this.inputElem = inputElem;
	}
	
	componentDidMount(){
		this.validate();
	}
	
	render(){
		var required = this.props.required !== undefined;
		var min = this.props.min !== undefined?this.props.min:undefined;
		var max = this.props.max !== undefined?this.props.max:undefined;

		return ( 
			<FormGroup className={"form-group"}>
				<Label for={this.props.name}><FormattedMessage {...this.props.label} /></Label>
				<Input 	innerRef={this.setInputElem} 
						name={this.props.name} 
						type={this.props.type} 
						className={"form-control"} 
						value={this.props.value} 
						onChange={this.onChangeHandler} 
						placeholder={this.props.placeholder} 
						required={required} 
						min={min} max={max} 
						invalid={!this.state.isValid}/>
				<FormFeedback>{this.state.errorMessage}</FormFeedback>
			</FormGroup>
		)
	}
}

MyInput.propTypes = {
	name: PropTypes.string,
	min: PropTypes.number,
	max: PropTypes.number,
	label: PropTypes.object.isRequired,
	type: PropTypes.string.isRequired,
	required: PropTypes.bool,
	value: PropTypes.any.isRequired,
	placeholder: PropTypes.string
};

export default MyInput;