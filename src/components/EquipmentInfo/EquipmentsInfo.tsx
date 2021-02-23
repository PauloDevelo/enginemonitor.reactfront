// eslint-disable-next-line no-use-before-define
import React, {
  useState, useEffect, useCallback,
} from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useEditModal from '../../hooks/EditModalHook';

import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';

import { createDefaultEquipment } from '../../helpers/EquipmentHelper';

// eslint-disable-next-line no-unused-vars
import { EquipmentModel } from '../../types/Types';

import equipmentManager from '../../services/EquipmentManager';

type Props = {
  className: string
}

function EquipmentsInfo({ className }: Props) {
  const [equipments, setEquipments] = useState<EquipmentModel[]>(equipmentManager.getEquipments());
  const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(equipmentManager.getCurrentEquipment());
  const modalHook = useEditModal<EquipmentModel | undefined>(undefined);

  const onCurrentEquipmentChanged = (newCurrentEquipmentChanged: EquipmentModel | undefined) => {
    setCurrentEquipment(newCurrentEquipmentChanged);
  };

  const onEquipmentsChanged = (newEquipments: EquipmentModel[]) => {
    setEquipments(newEquipments);
  };

  useEffect(() => {
    equipmentManager.registerOnCurrentEquipmentChanged(onCurrentEquipmentChanged);
    equipmentManager.registerOnEquipmentsChanged(onEquipmentsChanged);
    return () => {
      equipmentManager.unregisterOnCurrentEquipmentChanged(onCurrentEquipmentChanged);
      equipmentManager.unregisterOnEquipmentsChanged(onEquipmentsChanged);
    };
  }, []);

  const isCurrentEquipment = useCallback((equipment: EquipmentModel) => {
    if (currentEquipment === undefined || equipment === undefined) {
      return false;
    }

    return currentEquipment._uiId === equipment._uiId;
  }, [currentEquipment]);

  const tabPanes = equipments.map((equipment) => <EquipmentInfoTab key={equipment._uiId} equipment={equipment} displayEquipment={modalHook.displayData} />);

  const tabNavItems = equipments.map((equipment) => <EquipmentInfoNavItem key={equipment._uiId} equipment={equipment} active={isCurrentEquipment(equipment)} setCurrentEquipment={equipmentManager.setCurrentEquipment} />);

  return (
    <>
      <div className={className}>
        <span className="small mb-3">
          <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEquipment())} aria-label="Add">
            <FontAwesomeIcon icon={faPlusSquare} />
          </Button>
        </span>
        <>
          <Nav tabs>
            {tabNavItems}
          </Nav>
          <TabContent activeTab={currentEquipment ? currentEquipment._uiId : undefined}>
            {tabPanes}
          </TabContent>
        </>
      </div>
      {modalHook.data !== undefined && (
      <ModalEquipmentInfo
        equipment={modalHook.data}
        onEquipmentInfoSaved={equipmentManager.onEquipmentSaved}
        onEquipmentDeleted={equipmentManager.onEquipmentDeleted}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
      )}
    </>
  );
}

export default React.memo(EquipmentsInfo);
