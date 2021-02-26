/* eslint-disable react/require-default-props */
/* eslint-disable max-len */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import {
  faEdit, faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FormattedMessage, defineMessages } from 'react-intl';

import assetProxy from '../../services/AssetProxy';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import ModalSendInvitation from '../ModalSendInvitation/ModalSendInvitation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';
import GuestLink from '../GuestLink/GuestLink';

import userProxy from '../../services/UserProxy';
import userContext from '../../services/UserContext';

import '../../style/transition.css';

// eslint-disable-next-line no-unused-vars
import { AssetModel } from '../../types/Types';

import jsonMessages from './ModalEditAsset.messages.json';

const assetMsg = defineMessages(jsonMessages);

type Props = {
asset: AssetModel,
visible: boolean,
toggle?: () => void,
className?: string,
hideDeleteButton?: boolean
}

const ModalEditAsset = ({
  asset, visible, toggle, className, hideDeleteButton,
}: Props) => {
  const modalLogic = useEditModalLogic(
    {
      toggleEditModal: toggle,
      saveFunc: assetProxy.createOrSaveAsset,
      saveParams: [],
      deleteFunc: assetProxy.deleteAsset,
      deleteParams: [asset._uiId],
    },
  );
  const [isCreation, setIsCreation] = useState(false);
  const [alerts, setAlerts] = useState<any>(undefined);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [modalSendInvitationVisibility, setModalSendInvitationVisibility] = useState(false);

  useEffect(() => {
    setAlerts(undefined);
  }, [visible]);

  useEffect(() => {
    assetProxy.existAsset(asset._uiId).then((assetExist) => {
      setIsCreation(assetExist === false);

      if (assetExist) {
        userProxy.getCredentials({ assetUiId: asset._uiId }).then((userCredentials) => {
          setIsReadOnly(userCredentials.readonly);
        });
      } else {
        setIsReadOnly(userContext.getCurrentUser()?.forbidCreatingAsset !== false);
      }
    });
  }, [asset]);

  const toggleModalSendInvitation = useCallback(() => {
    setModalSendInvitationVisibility((prevVisibility) => !prevVisibility);
  }, []);

  const message = isCreation ? assetMsg.create : assetMsg.save;

  return (
    <>
      <Modal isOpen={visible} toggle={!toggle ? undefined : modalLogic.cancel} className={className} fade>
        <ModalHeader toggle={!toggle ? undefined : modalLogic.cancel}>
          <FontAwesomeIcon icon={isCreation ? faPlusSquare : faEdit} />
          {' '}
          {!isCreation && <FormattedMessage {...assetMsg.assetModalEditionTitle} />}
          {isCreation && <FormattedMessage {...assetMsg.assetModalCreationTitle} />}
        </ModalHeader>
        <ModalBody>
          {visible && (
          <MyForm submit={modalLogic.handleSubmit} id="formAsset" initialData={asset}>
            <MyInput name="name" label={assetMsg.name} type="text" required />
            <MyInput name="brand" label={assetMsg.brand} type="text" required />
            <MyInput name="modelBrand" label={assetMsg.model} type="text" required />
            <MyInput name="manufactureDate" label={assetMsg.manufactureDateLabel} type="date" required />
          </MyForm>
          )}
          {isCreation === false && <GuestLink asset={asset} onError={setAlerts} />}
          <Alerts errors={modalLogic.alerts || alerts} />
        </ModalBody>
        <ModalFooter>
          {!isCreation && !isReadOnly && <Button color="danger" onClick={toggleModalSendInvitation}><FormattedMessage {...assetMsg.sendOwnershipInvitation} /></Button>}
          {!isReadOnly && <ActionButton type="submit" isActing={modalLogic.isSaving} form="formAsset" color="success" message={message} />}
          {toggle && <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...assetMsg.cancel} /></Button>}
          {!isCreation && hideDeleteButton !== true && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...assetMsg.delete} /></Button>}
        </ModalFooter>
      </Modal>
      <ModalYesNoConfirmation
        visible={modalLogic.yesNoModalVisibility}
        toggle={modalLogic.toggleModalYesNoConfirmation}
        yes={modalLogic.yesDelete}
        isActing={modalLogic.isDeleting}
        no={modalLogic.toggleModalYesNoConfirmation}
        title={assetMsg.assetDeleteTitle}
        message={assetMsg.assetDeleteMsg}
        className="modal-dialog-centered"
      />
      {modalSendInvitationVisibility && <ModalSendInvitation toggle={toggleModalSendInvitation} visible={modalSendInvitationVisibility} asset={asset} className="modal-dialog-centered" />}
    </>
  );
};

export default ModalEditAsset;
