import React, { useCallback } from 'react';
import { Button, TabPane } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate, defineMessages, Messages } from 'react-intl';
import PropTypes from 'prop-types';

import jsonMessages from "./EquipmentInfo.messages.json";
const equipmentInfoMsg: Messages = defineMessages(jsonMessages);

import { Equipment, AgeAcquisitionType } from '../../types/Types';

type Props = {
    equipment: Equipment,
    displayEquipment?: (equipment: Equipment) => void
}

function EquipmentInfoTab({equipment, displayEquipment}: Props){
    const displayEquipmentCallBack = useCallback(() => {
        if(displayEquipment)
            displayEquipment(equipment);
    }, [equipment, displayEquipment]);

	return(
        <TabPane tabId={equipment._id}>
            <Button color="light" size="sm" className="float-right" onClick={displayEquipmentCallBack}><FontAwesomeIcon icon={faEdit} /></Button>					
            <span>{equipment.brand} {equipment.model} </span>
            {equipment.ageAcquisitionType !== AgeAcquisitionType.time && <span className="font-weight-bold">{equipment.age} h </span>}
            <FormattedMessage {...equipmentInfoMsg.installedOn} />
            <FormattedDate value={equipment.installation} />
        </TabPane>
	);
}

export default React.memo(EquipmentInfoTab);



EquipmentInfoTab.propTypes = {
    equipment: PropTypes.object.isRequired,
    displayEquipment: PropTypes.func
};