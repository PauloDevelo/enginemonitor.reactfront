/* eslint-disable max-len */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage, defineMessages } from 'react-intl';

import equipmentProxy from '../../services/EquipmentProxy';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import TranslatedOption from '../Form/TranslatedOption';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import '../../style/transition.css';
// eslint-disable-next-line no-unused-vars
import { EquipmentModel, AgeAcquisitionType } from '../../types/Types';

import jsonMessages from '../EquipmentInfo/EquipmentInfo.messages.json';

const equipmentInfoMsg = defineMessages(jsonMessages);

type Props = {
equipment: EquipmentModel,
onEquipmentInfoSaved: (equipment: EquipmentModel) => void,
onEquipmentDeleted: (equipment: EquipmentModel) => void,
visible: boolean,
toggle: () => void,
className: string
}

const ModalEquipmentInfo = ({
  equipment, onEquipmentInfoSaved, onEquipmentDeleted, visible, toggle, className,
}: Props) => {
  const [ageAcquisitionType, setAgeAcquisitionType] = useState(equipment.ageAcquisitionType);
  const modalLogic = useEditModalLogic(
    {
      toggleEditModal: toggle,
      saveFunc: equipmentProxy.createOrSaveEquipment,
      saveParams: [],
      onSavedCb: onEquipmentInfoSaved,
      deleteFunc: equipmentProxy.deleteEquipment,
      deleteParams: [equipment._uiId],
      onDeleteCallBack: onEquipmentDeleted,
    },
  );


  const [isCreation, setIsCreation] = useState(false);

  const onAgeAcquisitionTypeChanged = useCallback((ageAcquisitionTypeFromInput: string) => {
    const newAgeAcquisitionType = parseInt(ageAcquisitionTypeFromInput, 10);
    setAgeAcquisitionType(newAgeAcquisitionType);
  }, []);

  useEffect(() => {
    setAgeAcquisitionType(equipment.ageAcquisitionType);
    equipmentProxy.existEquipment(equipment._uiId).then((equipmentExist) => {
      setIsCreation(equipmentExist === false);
    });
  }, [equipment]);

  const message = isCreation ? equipmentInfoMsg.create : equipmentInfoMsg.save;

  return (
    <>
      <CSSTransition in={visible} timeout={300} classNames="modal">
        <Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
          <ModalHeader toggle={modalLogic.cancel}>
            <FontAwesomeIcon icon={isCreation ? faPlusSquare : faEdit} />
            {' '}
            {!isCreation && <FormattedMessage {...equipmentInfoMsg.modalTitle} />}
            {isCreation && <FormattedMessage {...equipmentInfoMsg.modalCreationTitle} />}
          </ModalHeader>
          <ModalBody>
            {visible && (
            <MyForm submit={modalLogic.handleSubmit} id="formEquipmentInfo" initialData={equipment}>
              <MyInput name="name" label={equipmentInfoMsg.name} type="text" required />
              <MyInput name="brand" label={equipmentInfoMsg.brand} type="text" required />
              <MyInput name="model" label={equipmentInfoMsg.model} type="text" required />
              <MyInput name="installation" label={equipmentInfoMsg.installDateLabel} type="date" required />
              <MyInput name="ageAcquisitionType" label={equipmentInfoMsg.ageAcquisitionType} type="select" required onChanged={onAgeAcquisitionTypeChanged} tooltip={equipmentInfoMsg.ageAcquisitionTypeTooltip}>
                <TranslatedOption value={AgeAcquisitionType.time} message={equipmentInfoMsg.time} />
                <TranslatedOption value={AgeAcquisitionType.manualEntry} message={equipmentInfoMsg.manualEntry} />
                <TranslatedOption value={AgeAcquisitionType.tracker} message={equipmentInfoMsg.tracker} />
              </MyInput>
              {ageAcquisitionType === AgeAcquisitionType.manualEntry && <MyInput name="age" label={equipmentInfoMsg.age} tooltip={equipmentInfoMsg.ageToolTip} type="number" required min={0} />}
              {ageAcquisitionType === AgeAcquisitionType.tracker && <MyInput name="ageUrl" label={equipmentInfoMsg.ageUrl} tooltip={equipmentInfoMsg.ageUrlToolTip} type="text" required min={0} />}
            </MyForm>
            )}
            <Alerts errors={modalLogic.alerts} />
          </ModalBody>
          <ModalFooter>
            <ActionButton type="submit" isActing={modalLogic.isSaving} form="formEquipmentInfo" color="success" message={message} />
            <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...equipmentInfoMsg.cancel} /></Button>
            {!isCreation && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...equipmentInfoMsg.delete} /></Button>}
          </ModalFooter>
        </Modal>
      </CSSTransition>
      <ModalYesNoConfirmation
        visible={modalLogic.yesNoModalVisibility}
        toggle={modalLogic.toggleModalYesNoConfirmation}
        yes={modalLogic.yesDelete}
        isActing={modalLogic.isDeleting}
        no={modalLogic.toggleModalYesNoConfirmation}
        title={equipmentInfoMsg.equipmentDeleteTitle}
        message={equipmentInfoMsg.equipmentDeleteMsg}
        className="modal-dialog-centered"
      />
    </>
  );
};

export default ModalEquipmentInfo;
