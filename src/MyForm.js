import React, {Component} from 'react';
import { Form } from 'reactstrap';

import PropTypes from 'prop-types';

import './MyForm.css';

class MyForm extends Component {
	
	constructor(props){
		super(props);
		
		this.state = {
			isValidated: false
		}
		
		this.validate = this.validate.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.setForm = this.setForm.bind(this);
	}
	
	validate(){
		return this.formEl.checkValidity() === true;
	}

	submitHandler(event){
		event.preventDefault();

		if (this.validate()) 
		{
			this.props.submit();
		}

		this.setState({isValidated: true});
	}
	
	setForm(form){
		this.formEl = form;
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.submit;

		let classNames = [];
		if (props.className) {
			classNames = Object.assign({}, props.className);
			delete props.className;
		}

		if (this.state.isValidated) {
			classNames.push('.was-validated');
		}

		return (
			<Form innerRef={this.setForm} onSubmit={this.submitHandler} {...props} className={classNames.toString()} noValidate>
				{this.props.children}
			</Form>
		);
	}
}

MyForm.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	submit: PropTypes.func.isRequired
};

export default MyForm;