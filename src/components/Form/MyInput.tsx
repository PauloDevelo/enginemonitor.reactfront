import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import ToolTip from '../ToolTip/ToolTip';

import { FormattedMessage } from 'react-intl';

type Props = {
	label: FormattedMessage.MessageDescriptor,
	tooltip?: FormattedMessage.MessageDescriptor,
	handleChange?: (name: string, value: string | boolean) => void,
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

const MyInput = React.memo(function MyInput({ label, tooltip, handleChange, onChanged, validationTrigger, children, ...props }:Props){
	const [validity, setValidity] = useState({ isValid: true, errorMessage: '' });
	const inputElemRef = useRef<any>();
	const tooltipElement = useMemo(() => { return tooltip ? ToolTip({tooltip}) : undefined }, [tooltip]);

	const validate = () => {
		const inputElem = inputElemRef.current;
		if(inputElem !== undefined){
			setValidity( { 
				isValid: inputElem.validity !== undefined ? inputElem.validity.valid : true, 
				errorMessage: inputElem.validationMessage 
			});
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
	
	const onChangeHandler = useCallback((event:React.ChangeEvent<HTMLInputElement>):void => {
		validate();

		const target:HTMLInputElement = event.target as HTMLInputElement;
		const newValue = target.type === 'checkbox' ? target.checked : target.value;

		if(typeof handleChange === 'function'){
			handleChange(props.name, newValue);
		}

		if(typeof onChanged === 'function'){
			onChanged(newValue);
		}
	}, [handleChange, onChanged, props.name]);
	
	if (props.type === 'checkbox'){
		const inlineValue = "true" as never;
		return (
			<FormGroup className={"form-group"} check inline={true}>
				<Label check inline={inlineValue}>
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
});

export default MyInput;