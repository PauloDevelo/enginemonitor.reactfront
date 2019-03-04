import React from 'react';
import { Button, TabPane } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';

import equipmentInfoMsg from "./EquipmentInfo.messages";

export default function EquipmentInfoTab({equipment, onClick}){
	return(
        <TabPane tabId={equipment._id}>
            <Button color="light" size="sm" className="float-right" onClick={() => {
                if(onClick)
                    onClick();
            }}><FontAwesomeIcon icon={faEdit} /></Button>					
            <div>
                <span>{equipment.brand} {equipment.model} </span>
                <span className="font-weight-bold">{equipment.age} h</span>		
            </div>
            <p className="d-block">
                <FormattedMessage {...equipmentInfoMsg.installedOn} />
                <FormattedDate value={equipment.installation} />
            </p>
        </TabPane>
	);
}

EquipmentInfoTab.propTypes = {
    equipment: PropTypes.object.isRequired,
    onClick: PropTypes.func
};