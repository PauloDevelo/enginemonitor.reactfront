import React, {
  useState, useEffect, useCallback,
} from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAsync } from 'react-async';
import equipmentProxy from '../../services/EquipmentProxy';

import useEditModal from '../../hooks/EditModalHook';

import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';
import Loading from '../Loading/Loading';

import { createDefaultEquipment } from '../../helpers/EquipmentHelper';

// eslint-disable-next-line no-unused-vars
import { EquipmentModel, AssetModel } from '../../types/Types';

import assetManager from '../../services/AssetManager';

type Props = {
changeCurrentEquipment: (equipment: EquipmentModel | undefined) => void,
extraClassNames: string
}

function EquipmentsInfo({ changeCurrentEquipment, extraClassNames }: Props) {
  const [currentAsset, setCurrentAsset] = useState<AssetModel | undefined>(undefined);
  const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(undefined);
  const modalHook = useEditModal<EquipmentModel | undefined>(undefined);

  useEffect(() => {
    assetManager.registerOnCurrentAssetChanged(setCurrentAsset);
    return () => assetManager.unregisterOnCurrentAssetChanged(setCurrentAsset);
  }, []);

  const isCurrentEquipment = useCallback((equipment: EquipmentModel) => {
    if (currentEquipment === undefined || equipment === undefined) {
      return false;
    }

    return currentEquipment._uiId === equipment._uiId;
  }, [currentEquipment]);

  useEffect(() => {
    changeCurrentEquipment(currentEquipment);
  }, [currentEquipment, changeCurrentEquipment]);

  const [equipments, setEquipments] = useState<EquipmentModel[]>([]);

  const fetchEquipments = useCallback(async () => {
    if (currentAsset !== undefined) {
      return equipmentProxy.fetchEquipments();
    }

    return Promise.resolve([]);
  }, [currentAsset]);
  const { data: fetchedEquipments, isLoading, isRejected } = useAsync({ promiseFn: fetchEquipments });

  useEffect(() => {
    setEquipments(fetchedEquipments || []);
  }, [fetchedEquipments]);

  useEffect(() => {
    if (isRejected) {
      setEquipments([]);
    }
  }, [isRejected]);

  useEffect(() => {
    if (equipments.length > 0) {
      setCurrentEquipment((previousCurrentEquipment) => {
        if (previousCurrentEquipment === undefined || equipments.findIndex((equipment: EquipmentModel) => previousCurrentEquipment._uiId === equipment._uiId) === -1) {
          return equipments[0];
        }
        const newCurrentEquipmentIndex = equipments.findIndex((equipment: EquipmentModel) => previousCurrentEquipment._uiId === equipment._uiId);
        return equipments[newCurrentEquipmentIndex];
      });
    } else {
      setCurrentEquipment(undefined);
    }
  }, [equipments]);

  const onEquipmentInfoSaved = useCallback(async (equipmentInfoSaved: EquipmentModel) => {
    const newEquipmentList = equipments.concat([]);
    const index = newEquipmentList.findIndex((equipmentInfo) => equipmentInfo._uiId === equipmentInfoSaved._uiId);

    if (index === -1) {
      newEquipmentList.push(equipmentInfoSaved);
    } else {
      newEquipmentList[index] = equipmentInfoSaved;
    }

    setEquipments(newEquipmentList);

    if (index === -1) {
      setCurrentEquipment(equipmentInfoSaved);
    }
  }, [equipments]);

  const onEquipmentDeleted = useCallback((deletedEquipment: EquipmentModel) => {
    const newEquipmentList = equipments.filter((equipmentInfo) => equipmentInfo._uiId !== deletedEquipment._uiId);
    setEquipments(newEquipmentList);

    setCurrentEquipment(newEquipmentList.length > 0 ? newEquipmentList[0] : undefined);
  }, [equipments]);

  const tabPanes = equipments.map((equipment) => <EquipmentInfoTab key={equipment._uiId} equipment={equipment} displayEquipment={modalHook.displayData} />);

  const tabNavItems = equipments.map((equipment) => <EquipmentInfoNavItem key={equipment._uiId} equipment={equipment} active={isCurrentEquipment(equipment)} setCurrentEquipment={setCurrentEquipment} />);

  return (
    <>
      <div className={extraClassNames}>
        <span className="small mb-3">
          <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEquipment())} aria-label="Add">
            <FontAwesomeIcon icon={faPlusSquare} />
          </Button>
        </span>
        {isLoading ? <Loading />
          : (
            <>
              <Nav tabs>
                {tabNavItems}
              </Nav>
              <TabContent activeTab={currentEquipment ? currentEquipment._uiId : undefined}>
                {tabPanes}
              </TabContent>
            </>
          )}
      </div>
      {modalHook.data !== undefined && (
      <ModalEquipmentInfo
        equipment={modalHook.data}
        onEquipmentInfoSaved={onEquipmentInfoSaved}
        onEquipmentDeleted={onEquipmentDeleted}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
      )}
    </>
  );
}

export default React.memo(EquipmentsInfo);
