import * as log from 'loglevel';
import React, { useState, useRef, useCallback } from 'react';
import { Form } from 'reactstrap';

import './MyForm.css';

/** Function that gets Date fields from an object. */
function getDateFields(obj:any):string[] {
  const dateKeys:string[] = [];
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    if (Object.prototype.toString.call(obj[key]) === '[object Date]') {
      dateKeys.push(key);
    }
  });

  return dateKeys;
}

/** Function that converts Date fields into a string usable by the Input of type Date. */
function convertDateFieldsToString(obj:any, dateKeys: string[]):any {
  const copyObj = { ...obj };

  dateKeys.forEach((dateKey) => {
    copyObj[dateKey] = obj[dateKey].toISOString().substr(0, 10);
  });

  return copyObj;
}

/** Function that will parse all convert back the data's field of type Date */
function convertDateFieldsToDate(data:any, keys:string[]):any {
  const dataCopy = { ...data };
  keys.forEach((key) => {
    dataCopy[key] = new Date(dataCopy[key]);
  });
  return dataCopy;
}

function isJSXElement(child: JSX.Element | boolean): child is JSX.Element { return typeof child !== 'boolean'; }

type Props = {
initialData: any;
submit: (data:any) => (void | Promise<void>);
children: (JSX.Element | boolean)[];
className?: string;
id: string;
};

const MyForm = ({
  initialData, submit, children, className, ...props
}:Props) => {
  const dateKeys = getDateFields(initialData);
  const copyInitialData = convertDateFieldsToString(initialData, dateKeys);

  const [validationTrigger, triggerValidation] = useState(0);
  const [data, setData] = useState({ data: copyInitialData, dateKeys });
  const formEl = useRef<any>();

  const validate = () => {
    triggerValidation(validationTrigger + 1);
    return formEl.current.checkValidity();
  };

  const submitHandler = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validate()) {
      const dataCopy = convertDateFieldsToDate(data.data, dateKeys);
      submit(dataCopy);
    }
  };

  const handleInputChange = useCallback((name: string, value: string | boolean | number) => {
    setData((previousData) => {
      if (previousData.data[name] === undefined) {
        log.warn(`The property ${name} is not defined in the data:`);
        log.warn(previousData.data);
      }

      const newData = { ...previousData };

      if (newData.data[name] !== undefined && typeof newData.data[name] === 'number' && typeof value === 'string') {
        newData.data[name] = parseInt(value as string, 10);
      } else {
        newData.data[name] = value;
      }

      return newData;
    });
  }, []);

  const elementChildren = children.filter((child) => isJSXElement(child)) as JSX.Element[];

  const childrenWithProps = React.Children.map(elementChildren, (child) => {
    let value: string | undefined;
    let checked: boolean | undefined;
    if (data.data[child.props.name] !== undefined && typeof data.data[child.props.name] === 'number') {
      value = data.data[child.props.name].toString();
    }
    if (data.data[child.props.name] !== undefined && typeof data.data[child.props.name] === 'boolean') {
      // value = data.data[child.props.name] ? 'true' : 'false';
      checked = data.data[child.props.name];
    } else {
      value = data.data[child.props.name];
    }

    const newProps = {
      handleChange: handleInputChange,
      validationTrigger,
      value,
      checked,
    };

    Object.assign(newProps, child.props);
    return React.cloneElement(child, newProps);
  });

  return (
    <Form innerRef={formEl} onSubmit={submitHandler} {...props} className={className} noValidate>
      {childrenWithProps}
    </Form>
  );
};

export default React.memo(MyForm);
