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
		this.handleInputChange = this.handleInputChange.bind(this);
	}
	
	validate(){
		return this.formEl.checkValidity() === true;
	}

	submitHandler(event){
		event.preventDefault();

		if (this.validate()){
			this.props.submit();
		}

		this.setState({isValidated: true});
	}
	
	setForm(form){
		this.formEl = form;
	}

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		this.props.onInputChange(name, { [name]: value});
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

		const { children } = this.props;
		const childrenWithProps = React.Children.map(children, child =>{
				var newProps = Object.assign({ handleChange: this.handleInputChange }, child.props);
				return React.cloneElement(child, newProps);
			}
		);

		return (
			<Form innerRef={this.setForm} onSubmit={this.submitHandler} {...props} className={classNames.toString()} noValidate>
				{childrenWithProps}
			</Form>
		);
	}
}

MyForm.propTypes = {
	onInputChange: PropTypes.isRequired,
	children: PropTypes.node,
	className: PropTypes.string,
	submit: PropTypes.func.isRequired
};

export default MyForm;