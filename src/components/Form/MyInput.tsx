import React, { useState, useRef, useEffect } from 'react';
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import ToolTip from '../ToolTip/ToolTip';

import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

type Props = {
	label: FormattedMessage.MessageDescriptor,
	tooltip?: FormattedMessage.MessageDescriptor,
	handleChange?: (event: any) => void,
	onChanged?: (newValue: any) => void,
	validationTrigger?: number,
	type: any,
	name: string,
	min?: number,
	max?: number,
	required?: boolean,
	readonly?: string,
	children?: JSX.Element[] | JSX.Element
};

export default function MyInput({ label, tooltip, handleChange, onChanged, validationTrigger, children, ...props }: Props) {
	const [validity, setValidity] = useState({ isValid: true, errorMessage: '' });
	const inputElemRef = useRef<any>();

	const validate = () => {
		const inputElem = inputElemRef.current;
		if(inputElem !== undefined){
			setValidity( { isValid: inputElem.validity !== undefined ? inputElem.validity.valid : true, errorMessage: inputElem.validationMessage });
		}
	};

	useEffect(() => {
		if(validationTrigger !== undefined && validationTrigger != 0){
			validate();
		}
	}, [validationTrigger]);

	useEffect(() => {
		setValidity({ isValid: true, errorMessage: '' });
	}, [inputElemRef]);
	
	const onChangeHandler = (event:React.ChangeEvent<HTMLInputElement>):void => {
		validate();
		if(typeof handleChange === 'function') handleChange(event);

		const target:HTMLInputElement = event.target as HTMLInputElement;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		if(typeof onChanged === 'function') onChanged(value);
	};

	let tooltipElement:JSX.Element | undefined = undefined;
	if (tooltip){
		tooltipElement = ToolTip({tooltip});
	}
	
	if (props.type === 'checkbox'){
		const inlineValue = "true";
		return (
			<FormGroup className={"form-group"} check inline={true}>
				<Label check inline={inlineValue as never}>
					<FormattedMessage {...label}/>{tooltipElement}{' '}
					<Input ref={inputElemRef} onChange={onChangeHandler} invalid={!validity.isValid} {...props}/>
				</Label>
			</FormGroup>
		);
	}

	return ( 
		<FormGroup className={"form-group"}>
			<Label for={props.name}><FormattedMessage {...label} />{tooltipElement}</Label>
			<Input 	innerRef={inputElemRef} 
					className={"form-control"}
					onChange={onChangeHandler} 
					invalid={!validity.isValid}
					{...props}>
				{children}
			</Input>
			{!validity.isValid && <FormFeedback>{validity.errorMessage}</FormFeedback>}
		</FormGroup>
	)
}

MyInput.propTypes = {
	onChanged: PropTypes.func,
	validationTrigger: PropTypes.number,
	name: PropTypes.string.isRequired,
	tooltip: PropTypes.object,
	min: PropTypes.number,
	max: PropTypes.number,
	label: PropTypes.object.isRequired,
	type: PropTypes.string.isRequired,
	required: PropTypes.bool,
	value: PropTypes.any,
	placeholder: PropTypes.string,
	children: PropTypes.node,
};