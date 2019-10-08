import React, { Fragment, useState, useEffect, ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import {Alert} from 'reactstrap';
import HttpError from '../../http/HttpError';

import {defineMessages, Messages} from "react-intl";
import jsonMessages from "./ErrorAlert.messages.json";
const alertMsg: Messages = defineMessages(jsonMessages);

type Props = {
    error: Error | undefined;
    className?: string;
    onDismiss: () => void;
}

const ErrorAlert = ({error, onDismiss, className}:Props) => {
    const [isVisible, setVisible] = useState(error !== undefined);

    useEffect(() => {
        setVisible(error !== undefined)
    }, [error]);

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

    let msgElement: string | ReactElement;
    if(alertMsg[message] !== undefined){
        msgElement = <FormattedMessage {...alertMsg[message]}/>;
    }
    else{
        msgElement = message;
    }

    return (
        <Fragment>
            <Alert color="danger" className={className} isOpen={isVisible} toggle={onDismiss}>
                <div className="text-center">{msgElement}</div>
            </Alert>
        </Fragment>
    )
}

export default React.memo(ErrorAlert);