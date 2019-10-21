import React, {Fragment} from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import jsonMessages from "./Alerts.messages.json";
const alertMsg = defineMessages(jsonMessages);

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
        const messageDescIndex = Object.keys(alertMsg).indexOf(error);
        if(messageDescIndex !== -1){
            const messageDesc = Object.values(alertMsg)[messageDescIndex];
            value = <FormattedMessage {...messageDesc}/>;
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
            let messageDescIndex = Object.keys(alertMsg).indexOf(key);
            if(messageDescIndex !== -1){
                const messageDesc = Object.values(alertMsg)[messageDescIndex];
                fieldElement = <FormattedMessage {...messageDesc}/>
            }

            let valueElement: any = errors[key];
            messageDescIndex = Object.keys(alertMsg).indexOf(valueElement);
            if(messageDescIndex !== -1){
                const messageDesc = Object.values(alertMsg)[messageDescIndex];
                valueElement = <FormattedMessage {...messageDesc}/>;
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