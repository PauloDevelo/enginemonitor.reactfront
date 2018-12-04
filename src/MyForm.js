import React from 'react';
import { Form } from 'reactstrap';

import PropTypes from 'prop-types';

import './MyForm.css';

/**Function that converts the Date fields of Data into a string useable by the Input of type Date. */
function convertDateFieldsToString(obj){
	var dateKeys = [];
	var keys = Object.keys(obj);
	keys.forEach(key => {
		if(Object.prototype.toString.call(obj[key]) === "[object Date]"){
			obj[key] = obj[key].toISOString().substr(0, 10);
			dateKeys.push(key);
		}
	});

	return dateKeys;
}

/**Function that will parse all convert back the data's field of type Date */
function convertDateFieldsToDate(data, keys){
	keys.forEach(key => {
		data[key] = new Date(data[key]);
	});
	return data;
}

class MyForm extends React.Component {
	
	constructor(props){
		super(props);
		
		this.state = {
			isValidated: false
		}
	}

	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.didMount === undefined){
			var initialData = Object.assign({}, nextProps.initialData);
			var dateKeys = convertDateFieldsToString(initialData);

			return {
				data: initialData,
				dateKeys: dateKeys,
				didMount: false
			}
		}
		else{
			return null;
		}
	}
	
	validate = () => this.formEl.checkValidity() === true

	submitHandler = (event) => {
		event.preventDefault();

		if (this.validate()){
			var data = Object.assign({}, this.state.data);
			convertDateFieldsToDate(data, this.state.dateKeys);
			this.props.submit(data);
		}

		this.setState({isValidated: true});
	}
	
	setForm = (form) => this.formEl = form;

	handleInputChange = (event) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		if(this.state.data[name] === undefined){
			console.log('The property ' + name + ' is not defined in the data:');
			console.log(this.state.data);
		}

		this.setState((prevState, props) => { 
			prevState.data[name] = value;
			return prevState;
		});
	}

	componentDidMount(){
		this.setState((prevState, props) => { return { didMount: true }});
	}

	render() {
		const props = Object.assign({}, this.props);
		delete props.submit;
		delete props.initialData;

		let classNames = [];
		if (props.className) {
			classNames = Object.assign({}, props.className);
			delete props.className;
		}

		if (this.state.isValidated) {
			classNames.push('.was-validated');
		}

		const { children } = props;
		const childrenWithProps = React.Children.map(children, child =>{
				var newProps = { 
					value: this.state.data[child.props.name],
					handleChange: this.handleInputChange.bind(this),
				};

				Object.assign(
					newProps, 
					child.props);
				return React.cloneElement(child, newProps);
			}
		);
		delete props.children;

		return (
			<Form innerRef={this.setForm} onSubmit={this.submitHandler} {...props} className={classNames.toString()} noValidate>
				{childrenWithProps}
			</Form>
		);
	}
}

MyForm.propTypes = {
	initialData: PropTypes.object.isRequired,
	children: PropTypes.node,
	className: PropTypes.string,
	submit: PropTypes.func.isRequired
};

export default MyForm;