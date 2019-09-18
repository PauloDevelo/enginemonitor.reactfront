import React, { Fragment, useState, useEffect, ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import {Alert} from 'reactstrap';
import { useTraceUpdate } from '../../hooks/Debug';
import HttpError from '../../http/HttpError';

import {defineMessages, Messages} from "react-intl";
import jsonMessages from "./ErrorAlert.messages.json";
const alertMsg: Messages = defineMessages(jsonMessages);

type Props = {
    hasError: boolean;
    error: Error | undefined;
    className: string;
    onDismiss: () => void;
}

const ErrorAlert = ({hasError, error, onDismiss, className}:Props) => {
    useTraceUpdate("ErrorAlert", {hasError, error, onDismiss, className});
    const [isVisible, setVisible] = useState(hasError);

    useEffect(() => {
        setVisible(hasError)
    }, [hasError]);

    let message:string = "";
    if(error !== undefined){
        if(error instanceof HttpError)
        {
            message = error.data.message;
        }
        else{
            message = error.message;
        }
    }

    let msgElmt: string | ReactElement;
    if(alertMsg[message] !== undefined){
        msgElmt = <FormattedMessage {...alertMsg[message]}/>;
    }
    else{
        msgElmt = message;
    }

    return (
        <Fragment>
            <Alert color="danger" className={className} isOpen={isVisible} toggle={onDismiss}>
                <div className="text-center">{msgElmt}</div>
            </Alert>
        </Fragment>
    )
}

export default React.memo(ErrorAlert);