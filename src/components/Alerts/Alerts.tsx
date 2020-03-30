import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import classNames from 'classnames';
import TemporalAlert from '../TemporalAlert/TemporalAlert';

import jsonMessages from './Alerts.messages.json';

const alertMsg = defineMessages(jsonMessages);

function isString(value: any) {
  return typeof value === 'string' || value instanceof String;
}

type Props = {
    color?: string,
    error?:string,
    errors?: any,
    children?: JSX.Element[] | JSX.Element,
    className?: string
};

const Alerts = ({
  color, error, errors, children, className,
}:Props) => {
  const strColor = color === undefined ? 'danger' : color;

  const strError = isString(errors) ? errors : error;

  if (strError) {
    let value:any;
    const messageDescIndex = Object.keys(alertMsg).indexOf(strError);
    if (messageDescIndex !== -1) {
      const messageDesc = Object.values(alertMsg)[messageDescIndex];
      value = <FormattedMessage {...messageDesc} />;
    } else {
      value = strError;
    }
    return (
      <TemporalAlert className={classNames(className, 'sm')} color={strColor} delayInMs={3000}>
        {value}
        {children}
      </TemporalAlert>
    );
  }

  let alerts:JSX.Element[] = [];
  if (errors) {
    const validKeys:string[] = [];
    const keys: string[] = Object.keys(errors);
    keys.forEach((key) => {
      if (isString(errors[key])) {
        validKeys.push(key);
      }
    });

    alerts = validKeys.map((key) => {
      let fieldElement: any = key;
      let messageDescIndex = Object.keys(alertMsg).indexOf(key);
      if (messageDescIndex !== -1) {
        const messageDesc = Object.values(alertMsg)[messageDescIndex];
        fieldElement = <FormattedMessage {...messageDesc} />;
      }

      let valueElement: any = errors[key];
      messageDescIndex = Object.keys(alertMsg).indexOf(valueElement);
      if (messageDescIndex !== -1) {
        const messageDesc = Object.values(alertMsg)[messageDescIndex];
        valueElement = <FormattedMessage {...messageDesc} />;
      }

      return (
        <TemporalAlert className={classNames(className, 'sm')} key={key} color={strColor} delayInMs={3000}>
          { fieldElement }
          <span>
            {' '}
            {valueElement}
          </span>
          {children}
        </TemporalAlert>
      );
    });
  }

  return (
    <>
      {alerts}
    </>
  );
};

export default Alerts;
