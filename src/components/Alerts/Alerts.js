import React, {Fragment} from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import alertMsg from "./Alerts.messages";

function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

const Alerts = ({errors, color}) => {
    if(color === undefined){
        color = "danger";
    }

    let alerts = [];
    if(errors){
        if(isString(errors)){
            alerts = <Alert className="sm" color={color}>
                        {alertMsg[errors] !== undefined && <FormattedMessage {...alertMsg[errors]}/>}{alertMsg[errors] === undefined && {errors}}
                    </Alert>;
        }
        else{
            let validKeys = [];
            let keys = Object.keys(errors);
            keys.forEach(key => {
                if(isString(errors[key])){
                    validKeys.push(key);
                }
            });

            alerts = validKeys.map(key => {
                return(
                    <Alert className="sm" key={key} color={color}>
                        {alertMsg[key] !== undefined && <FormattedMessage {...alertMsg[key]}/>}{alertMsg[key] === undefined && {key}}
                        {errors[key] !== undefined && <span>{' '} {alertMsg[errors[key]] !== undefined && <FormattedMessage {...alertMsg[errors[key]]}/>} {alertMsg[errors[key]] === undefined && errors[key]}</span>}
                    </Alert>)
            });
        }
    }

    return <Fragment>
        {alerts}
    </Fragment>
}

Alerts.propTypes = {
    errors: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
    color: PropTypes.string
};

export default Alerts;