import React, {Fragment} from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes, { any } from 'prop-types';

import {defineMessages, Messages} from "react-intl";
import jsonMessages from "./Alerts.messages.json";
const alertMsg: Messages = defineMessages(jsonMessages);

function isString (value: any) {
    return typeof value === 'string' || value instanceof String;
};

type Props = {
    color?: string,
    error?:string,
    errors?: any,
    children?: JSX.Element[] | JSX.Element
};

const Alerts = ({color, error, errors, children}:Props) => {
    if(color === undefined){
        color = "danger";
    }

    if(isString(errors)){
        error = errors;
    }
    
    if(error){
        let value:any;
        if(alertMsg[error] !== undefined){
            value = <FormattedMessage {...alertMsg[error]}/>;
        }
        else{
            value = error;
        }
        return <Alert className="sm" color={color}>
            {value}
            {children}
        </Alert>;
    }

    let alerts:JSX.Element[] = [];
    if(errors){
        const validKeys:string[] = [];
        const keys: string[] = Object.keys(errors);
        keys.forEach(key => {
            if(isString(errors[key])){
                validKeys.push(key);
            }
        });

        alerts = validKeys.map(key => {
            let fieldElement: any = key;
            if(alertMsg[key] !== undefined){
                fieldElement = <FormattedMessage {...alertMsg[key]}/>
            }

            let valueElement: any = errors[key];
            if(alertMsg[errors[key]] !== undefined){
                valueElement = <FormattedMessage {...alertMsg[errors[key]]}/>;
            }

            return(
                <Alert className="sm" key={key} color={color}>
                    { fieldElement }<span>{' '}{valueElement}</span>
                    {children}
                </Alert>
            );
        });
    }

    return <Fragment>
        {alerts}
    </Fragment>
};

Alerts.propTypes = {
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
    color: PropTypes.string,
    children: PropTypes.node,
};

export default Alerts;