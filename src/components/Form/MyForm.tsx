import React, {useState, useRef, useCallback} from 'react';
import { Form } from 'reactstrap';

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

function isJSXElement(child: JSX.Element | boolean): child is JSX.Element { return typeof child !== "boolean" };

type Props = {
	initialData: any,
	submit: (data:any) => (void | Promise<void>), 
	children: (JSX.Element | boolean)[], 
	className?: string,
	id: string
};

const MyForm = React.memo(function MyForm({ initialData , submit, children, className, ...props}:Props) {
	const copyInitialData = Object.assign({}, initialData);
	const dateKeys = convertDateFieldsToString(copyInitialData);

	const [validationTrigger, triggerValidation] = useState(0);
	const [data, setData] = useState({ data: copyInitialData, dateKeys: dateKeys });
	const formEl = useRef<any>();

	const validate = () => {
		triggerValidation(validationTrigger + 1);
		return formEl.current.checkValidity() === true;
	};

	const submitHandler = (event:React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (validate()){
			var dataCopy = Object.assign({}, data.data);
			convertDateFieldsToDate(dataCopy, dateKeys);
			submit(dataCopy);
		}
	}

	const handleInputChange = useCallback((name: string , value: string | boolean | number) => {
		setData(previousData => {
			if(previousData.data[name] === undefined){
				console.log('The property ' + name + ' is not defined in the data:');
				console.log(previousData.data);
			}
	
			const newData = Object.assign({}, previousData);
	
			if(newData.data[name] !== undefined && typeof newData.data[name] === 'number' && typeof value === 'string'){
				newData.data[name] = parseInt(value as string, 10);
			}
			else{
				newData.data[name] = value
			}

			return newData;
		});
	}, []);

	const elementChildren = children.filter(child => isJSXElement(child)) as JSX.Element[];

	const childrenWithProps = React.Children.map(elementChildren, child =>{
			var newProps = { 
			value: data.data[child.props.name],
			handleChange: handleInputChange,
			validationTrigger: validationTrigger
		};

		Object.assign(newProps, child.props);
		return React.cloneElement(child, newProps);
	});

	return (
		<Form innerRef={formEl} onSubmit={submitHandler} {...props} className={className} noValidate>
			{childrenWithProps}
		</Form>
	);
});

export default MyForm;