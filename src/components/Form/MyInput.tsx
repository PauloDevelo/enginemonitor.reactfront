import React, { useState, useRef, useEffect } from 'react';
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { InputType } from 'zlib';

type Props = {
	label: FormattedMessage.MessageDescriptor,
	handleChange?: (event: any) => void,
	type: any,
	name: string,
	min?: number,
	max?: number,
	required?: boolean,
	readonly?: string
}

export default function MyInput({ label, handleChange, ...props }: Props) {
	const [validity, setValidity] = useState({ isValid: true, errorMessage: '' });
	const inputElemRef = useRef<any>();

	const validate = () => {
		const inputElem = inputElemRef.current;
		if(inputElem !== undefined){
			setValidity( { isValid: inputElem.validity !== undefined ? inputElem.validity.valid : true, errorMessage: inputElem.validationMessage });
		}
	};

	useEffect(() => 
		validate()
	, [inputElemRef]);
	
	const onChangeHandler = (event:React.ChangeEvent<HTMLInputElement>):void => {
		validate();
		if(typeof handleChange === 'function') handleChange(event);
	};
	
	if (props.type === 'checkbox'){
		const inlineValue = "true";
		return (
			<FormGroup className={"form-group"} check inline={true}>
				<Label check inline={inlineValue as never}>
					<FormattedMessage {...label} />{' '}
					<Input ref={inputElemRef} onChange={onChangeHandler} invalid={!validity.isValid} {...props} />
				</Label>
			</FormGroup>
		);
	}

	return ( 
		<FormGroup className={"form-group"}>
			<Label for={props.name}><FormattedMessage {...label} /></Label>
			<Input 	innerRef={inputElemRef} 
					className={"form-control"}
					onChange={onChangeHandler} 
					invalid={!validity.isValid}
					{...props}/>
			{!validity.isValid && <FormFeedback>{validity.errorMessage}</FormFeedback>}
		</FormGroup>
	)
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