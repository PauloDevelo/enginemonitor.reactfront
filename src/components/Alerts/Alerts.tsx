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
    color: PropTypes.string
};

export default Alerts;