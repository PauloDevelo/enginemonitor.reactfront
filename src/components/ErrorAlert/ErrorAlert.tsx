import React, {
  // eslint-disable-next-line no-unused-vars
  useState, useEffect, ReactElement, useRef,
} from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import { Alert } from 'reactstrap';
import HttpError from '../../http/HttpError';

import jsonMessages from './ErrorAlert.messages.json';

const alertMsg = defineMessages(jsonMessages);

type Props = {
    error: Error | undefined;
    // eslint-disable-next-line react/require-default-props
    className?: string;
    onDismiss: () => void;
    timeoutInMs: number;
}

const ErrorAlert = ({
  error, onDismiss, className, timeoutInMs,
}:Props) => {
  const [isVisible, setVisible] = useState(error !== undefined);
  // eslint-disable-next-line no-undef
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  };

  useEffect(() => () => {
    clearTimer();
  }, []);

  useEffect(() => {
    setVisible((wasVisible) => {
      if (error !== undefined) {
        clearTimer();
        timer.current = setTimeout(() => onDismiss(), timeoutInMs);
      }

      if (error === undefined && wasVisible) {
        clearTimer();
      }

      return error !== undefined;
    });
  }, [error, timeoutInMs, onDismiss]);

  let message:string = '';
  if (error !== undefined) {
    if (error instanceof HttpError) {
      message = error.data.message ? error.data.message : error.data;
    } else {
      message = error.message;
    }
  }

  let msgElement: string | ReactElement;

  const messageDescIndex = Object.keys(alertMsg).indexOf(message);
  if (messageDescIndex !== -1) {
    const messageDesc = Object.values(alertMsg)[messageDescIndex];
    msgElement = <FormattedMessage {...messageDesc} />;
  } else {
    msgElement = message;
  }

  return (
    <Alert color="danger" className={className} isOpen={isVisible} toggle={onDismiss} fade>
      <div className="text-center">{msgElement}</div>
    </Alert>
  );
};

export default React.memo(ErrorAlert);
