import React from 'react';
import { Button, TabPane } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';

import equipmentInfoMsg from "./EquipmentInfo.messages";
import { Equipment } from '../../types/Types';

type Props = {
    equipment: Equipment,
    onClick?: () => void
}

export default function EquipmentInfoTab({equipment, onClick}: Props){
	return(
        <TabPane tabId={equipment._id}>
            <Button color="light" size="sm" className="float-right" onClick={() => {
                if(onClick)
                    onClick();
            }}><FontAwesomeIcon icon={faEdit} /></Button>					
            <span>{equipment.brand} {equipment.model} </span>
            <span className="font-weight-bold">{equipment.age} h </span>
            <FormattedMessage {...equipmentInfoMsg.installedOn} />
            <FormattedDate value={equipment.installation} />
        </TabPane>
	);
}

EquipmentInfoTab.propTypes = {
    equipment: PropTypes.object.isRequired,
    onClick: PropTypes.func
};