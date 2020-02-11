import React, {
  // eslint-disable-next-line no-unused-vars
  useState, useEffect, ReactElement,
} from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import { Alert } from 'reactstrap';
import HttpError from '../../http/HttpError';


import jsonMessages from './ErrorAlert.messages.json';

const alertMsg = defineMessages(jsonMessages);

type Props = {
    error: Error | undefined;
    className?: string;
    onDismiss: () => void;
}

const ErrorAlert = ({ error, onDismiss, className }:Props) => {
  const [isVisible, setVisible] = useState(error !== undefined);

  useEffect(() => {
    setVisible(error !== undefined);
  }, [error]);

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
    <>
      <Alert color="danger" className={className} isOpen={isVisible} toggle={onDismiss}>
        <div className="text-center">{msgElement}</div>
      </Alert>
    </>
  );
};

export default React.memo(ErrorAlert);
