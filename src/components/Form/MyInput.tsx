/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */

import React, {
  useState, useRef, useEffect, useMemo, useCallback,
} from 'react';
import {
  FormGroup, Label, Input, FormFeedback,
} from 'reactstrap';
// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import ToolTip from '../ToolTip/ToolTip';

type Props = {
label: MessageDescriptor,
tooltip?: MessageDescriptor,
handleChange?: (name: string, value: string | boolean) => void,
onChanged?: (newValue: any) => void,
validationTrigger?: number,
type: any,
name: string,
min?: number,
max?: number,
required?: boolean,
readOnly?: boolean,
// eslint-disable-next-line no-undef
children?: JSX.Element[] | JSX.Element,
value?: string | number,
checked?: boolean
};

const MyInput = React.memo(({
  label, tooltip, handleChange, onChanged, validationTrigger, children, ...props
}:Props) => {
  const [validity, setValidity] = useState({ isValid: true, errorMessage: '' });
  const inputElemRef = useRef<any>();
  const tooltipElement = useMemo(() => (tooltip ? ToolTip({ tooltip }) : undefined), [tooltip]);

  const validate = () => {
    const inputElem = inputElemRef.current;
    if (inputElem !== undefined) {
      setValidity({
        isValid: inputElem.validity !== undefined ? inputElem.validity.valid : true,
        errorMessage: inputElem.validationMessage,
      });
    }
  };

  useEffect(() => {
    if (validationTrigger !== undefined && validationTrigger !== 0) {
      validate();
    }
  }, [validationTrigger]);

  useEffect(() => {
    setValidity({ isValid: true, errorMessage: '' });
  }, [inputElemRef]);

  const onChangeHandler = useCallback((event:React.ChangeEvent<HTMLInputElement>):void => {
    validate();

    const target:HTMLInputElement = event.target as HTMLInputElement;
    const newValue = props.type === 'checkbox' ? target.checked : target.value;

    if (typeof handleChange === 'function') {
      handleChange(props.name, newValue);
    }

    if (typeof onChanged === 'function') {
      onChanged(newValue);
    }
  }, [handleChange, onChanged, props.name, props.type]);

  if (props.type === 'checkbox') {
    return (
      <FormGroup className="form-group" check inline>
        <Label check>
          <FormattedMessage {...label} />
          {tooltipElement}
          {' '}
          <Input innerRef={inputElemRef} onChange={onChangeHandler} invalid={!validity.isValid} {...props} />
          {!validity.isValid && <FormFeedback>{validity.errorMessage}</FormFeedback>}
        </Label>
      </FormGroup>
    );
  }

  return (
    <FormGroup className="form-group">
      <Label for={props.name}>
        <FormattedMessage {...label} />
        {tooltipElement}
      </Label>
      <Input
        innerRef={inputElemRef}
        className="form-control"
        onChange={onChangeHandler}
        invalid={!validity.isValid}
        {...props}
      >
        {children}
      </Input>
      {!validity.isValid && <FormFeedback>{validity.errorMessage}</FormFeedback>}
    </FormGroup>
  );
});

export default MyInput;
