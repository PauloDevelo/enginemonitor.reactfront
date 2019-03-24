import React, {Fragment} from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import alertMsg from "./Alerts.messages";

const Alerts = ({errors, color}) => {
    if(color === undefined){
        color = "danger";
    }

    let alerts = [];
    if(errors){
        let keys = Object.keys(errors);
        alerts = keys.map(key => {
            return(
                <Alert className="sm" key={key} color={color}>
                    <FormattedMessage {...alertMsg[key]}/>{errors[key] !== undefined && <span>{' '} <FormattedMessage {...alertMsg[errors[key]]}/></span>}
                </Alert>)
        });
    }

    return <Fragment>
        {alerts}
    </Fragment>
}

Alerts.propTypes = {
    errors: PropTypes.object,
    color: PropTypes.string
};

export default Alerts;