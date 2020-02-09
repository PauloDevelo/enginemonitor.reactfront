/* eslint-disable max-len */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { CSSTransition } from 'react-transition-group';

import { FormattedMessage, defineMessages } from 'react-intl';

import assetProxy from '../../services/AssetProxy';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import '../../style/transition.css';

// eslint-disable-next-line no-unused-vars
import { AssetModel } from '../../types/Types';

import jsonMessages from './ModalEditAsset.messages.json';

const assetMsg = defineMessages(jsonMessages);

type Props = {
asset: AssetModel,
visible: boolean,
toggle?: () => void,
className: string
}

const ModalEditAsset = ({
  asset, visible, toggle, className,
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

  useEffect(() => {
    assetProxy.existAsset(asset._uiId).then((assetExist) => {
      setIsCreation(assetExist === false);
    });
  }, [asset]);

  const message = isCreation ? assetMsg.create : assetMsg.save;

  return (
    <>
      <CSSTransition in={visible} timeout={300} classNames="modal">
        <Modal isOpen={visible} toggle={!toggle ? undefined : modalLogic.cancel} className={className} fade={false}>
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
            <Alerts errors={modalLogic.alerts} />
          </ModalBody>
          <ModalFooter>
            <ActionButton type="submit" isActing={modalLogic.isSaving} form="formAsset" color="success" message={message} />
            {toggle && <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...assetMsg.cancel} /></Button>}
            {!isCreation && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...assetMsg.delete} /></Button>}
          </ModalFooter>
        </Modal>
      </CSSTransition>
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
    </>
  );
};

export default ModalEditAsset;
