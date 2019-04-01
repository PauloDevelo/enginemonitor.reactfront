import React, {useState, useRef, useEffect} from 'react';
import { Form } from 'reactstrap';

import PropTypes from 'prop-types';

import './MyForm.css';

/**Function that converts the Date fields of Data into a string useable by the Input of type Date. */
function convertDateFieldsToString(obj:any){
	var dateKeys:string[] = [];
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
function convertDateFieldsToDate(data:any, keys:string[]){
	keys.forEach(key => {
		data[key] = new Date(data[key]);
	});
	return data;
}

type Props = {
	initialData: any,
	submit: (data:any) => void, 
	children: JSX.Element[], 
	className: string
};

export default function MyForm({ initialData , submit, children, className, ...props}:Props) {
	initialData = Object.assign({}, initialData);
	var dateKeys = convertDateFieldsToString(initialData);
	const [classNames, setClassNames] = useState(className === undefined ? [] : className.split(' '));
	const [isValidated, setIsValidated] = useState(false);
	const [data, setData] = useState({ data: initialData, dateKeys: dateKeys });
	const formEl = useRef<any>();

	useEffect(() => {
		let newClassNames:string[] = classNames.slice().filter(className => className !== '.was-validated');

		if (isValidated) {
			newClassNames.push('.was-validated');
		}

		setClassNames(newClassNames);
	}, [isValidated]);

	const validate = () => formEl.current.checkValidity() === true;

	const submitHandler = (event:React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (validate()){
			var dataCopy = Object.assign({}, data.data);
			convertDateFieldsToDate(dataCopy, dateKeys);
			submit(dataCopy);
		}

		setIsValidated(true);
	}

	const handleInputChange = (event:React.FormEvent<HTMLInputElement>) => {
		const target:HTMLInputElement = event.target as HTMLInputElement;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		if(data.data[name] === undefined){
			console.log('The property ' + name + ' is not defined in the data:');
			console.log(data.data);
		}

		const newData = Object.assign({}, data);
		newData.data[name] = value;
		setData(newData);
	}

	const childrenWithProps = React.Children.map(children, child =>{
		var newProps = { 
			value: data.data[child.props.name],
			handleChange: handleInputChange,
		};

		Object.assign(
			newProps, 
			child.props);
		return React.cloneElement(child, newProps);
	});

	return (
		<Form innerRef={formEl} onSubmit={submitHandler} {...props} className={classNames.toString()} noValidate>
			{childrenWithProps}
		</Form>
	);
}

MyForm.propTypes = {
	initialData: PropTypes.object.isRequired,
	children: PropTypes.node,
	className: PropTypes.string,
	submit: PropTypes.func.isRequired
};