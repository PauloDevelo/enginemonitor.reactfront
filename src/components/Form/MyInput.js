import React, { useState, useRef, useEffect } from 'react';
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

export default function MyInput({ label, handleChange, ...props }) {
	const [validity, setValidity] = useState({ isValid: true, errorMessage: undefined });
	const inputElem = useRef();

	const validate = () => setValidity(
		{
			isValid: inputElem.current.validity !== undefined ? inputElem.current.validity.valid : true,
			errorMessage: inputElem.current.validationMessage
		}
	);

	useEffect(() => 
		validate()
	, [inputElem]);
	
	const onChangeHandler = (event) => {
		validate();
		if(typeof handleChange === 'function') handleChange(event);
	};
	
	if (props.type === 'checkbox'){
		return (
			<FormGroup className={"form-group"} check inline={true}>
				<Label check inline="true">
					<FormattedMessage {...label} />{' '}
					<Input ref={inputElem} onChange={onChangeHandler} invalid={!validity.isValid} {...props} />
				</Label>
			</FormGroup>
		);
	}

	return ( 
		<FormGroup className={"form-group"}>
			<Label for={props.name}><FormattedMessage {...label} /></Label>
			<Input 	innerRef={inputElem} 
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