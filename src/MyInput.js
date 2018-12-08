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
	}
	
	validate = () => this.setState((prevState, props) => {
		return{
			isValid: this.inputElem.validity.valid,
			errorMessage: this.inputElem.validationMessage
		}
	});
	
	
	onChangeHandler = (event) => {
		this.validate();
		if(typeof this.props.handleChange === 'function') this.props.handleChange(event);
	}
	
	setInputElem = (inputElem) => this.inputElem = inputElem;
	
	componentDidMount(){
		this.validate();
	}
	
	render(){
		var props = Object.assign({}, this.props);
		delete props.label;
		delete props.handleChange;

		if (props.type === 'checkbox'){
			return (
				<FormGroup className={"form-group"} check inline={true}>
					<Label check inline="true">
						<FormattedMessage {...this.props.label} />{' '}
						<Input innerRef={this.setInputElem} onChange={this.onChangeHandler} invalid={!this.state.isValid} {...props} />
					</Label>
				</FormGroup>
			);
		}

		return ( 
			<FormGroup className={"form-group"}>
				<Label for={props.name}><FormattedMessage {...this.props.label} /></Label>
				<Input 	innerRef={this.setInputElem} 
						className={"form-control"}
						onChange={this.onChangeHandler} 
						invalid={!this.state.isValid}
						{...props}/>
				<FormFeedback>{this.state.errorMessage}</FormFeedback>
			</FormGroup>
		)
	}
}

MyInput.propTypes = {
	name: PropTypes.string.isRequired,
	min: PropTypes.number,
	max: PropTypes.number,
	label: PropTypes.object.isRequired,
	type: PropTypes.string.isRequired,
	required: PropTypes.bool,
	value: PropTypes.any,
	placeholder: PropTypes.string
};

export default MyInput;