import React, {Fragment} from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes, { any } from 'prop-types';

import alertMsg from "./Alerts.messages";

function isString (value: any) {
    return typeof value === 'string' || value instanceof String;
};

type Props = {
    color?: string,
    error?:string,
    errors?: any,  
};

const Alerts = ({color, error, errors}:Props) => {
    if(color === undefined){
        color = "danger";
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
            return(
                <Alert className="sm" key={key} color={color}>
                    {alertMsg[key] !== undefined && <FormattedMessage {...alertMsg[key]}/>}{alertMsg[key] === undefined && {key}}
                    {errors[key] !== undefined && <span>{' '}{alertMsg[errors[key]] !== undefined && <FormattedMessage {...alertMsg[errors[key]]}/>}{alertMsg[errors[key]] === undefined && errors[key]}</span>}
                </Alert>)
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
    color: PropTypes.string
};

export default Alerts;