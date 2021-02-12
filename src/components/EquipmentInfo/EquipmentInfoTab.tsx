import React, { useCallback } from 'react';
import { Button, TabPane } from 'reactstrap';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate, defineMessages } from 'react-intl';

import Gallery from '../Gallery/Gallery';

// eslint-disable-next-line no-unused-vars
import { EquipmentModel, AgeAcquisitionType } from '../../types/Types';

import jsonMessages from './EquipmentInfo.messages.json';

const equipmentInfoMsg = defineMessages(jsonMessages);

type Props = {
    equipment: EquipmentModel,
    displayEquipment?: (equipment: EquipmentModel) => void
}

function EquipmentInfoTab({ equipment, displayEquipment }: Props) {
  const displayEquipmentCallBack = useCallback(() => {
    if (displayEquipment) { displayEquipment(equipment); }
  }, [equipment, displayEquipment]);

  return (
    <TabPane tabId={equipment._uiId}>
      <div className="flex-row">
        <div>
          <span>
            {equipment.brand}
            {' '}
            {equipment.model}
            {' '}
          </span>
          {equipment.ageAcquisitionType !== AgeAcquisitionType.time && (
          <span className="font-weight-bold">
            {equipment.age}
            {' '}
            h
            {' '}
          </span>
          )}
          <FormattedMessage {...equipmentInfoMsg.installedOn} />
          <FormattedDate value={equipment.installation} />
        </div>
        <Button color="light" size="sm" onClick={displayEquipmentCallBack} aria-label="Edit"><FontAwesomeIcon icon={faEdit} /></Button>
      </div>
      <Gallery parentUiId={equipment._uiId} />
    </TabPane>
  );
}

export default React.memo(EquipmentInfoTab);
