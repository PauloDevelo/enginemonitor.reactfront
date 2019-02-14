import React from "react";
import { Alert } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import alertMsg from "./Alerts.messages";

const Alerts = ({errors}) => {
    let alerts = [];
    if(errors){
        let keys = Object.keys(errors);
        alerts = keys.map(key => {
            return(
                <Alert className="sm" key={key} color="danger">
                    <FormattedMessage {...alertMsg[key]}/> {' '} <FormattedMessage {...alertMsg[errors[key]]}/>
                </Alert>)
        });
    }

    return <div>
        {alerts}
    </div>
}

Alerts.propTypes = {
    errors: PropTypes.object
};

export default Alerts;