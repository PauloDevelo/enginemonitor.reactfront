/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */
// eslint-disable-next-line no-use-before-define
import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';

import storageService from '../../services/StorageService';

import Img from '../ImageComponent/Img';
import Loading from '../Loading/Loading';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import imageProxy from '../../services/ImageProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import '../../style/transition.css';
import { ImageModel } from '../../types/Types';

import jsonMessages from './ModalEditImage.messages.json';

const editImageMsg = defineMessages(jsonMessages);

type Props = {
    image: ImageModel | undefined,
    visible: boolean,
onImageSaved: (image: ImageModel) => void,
toggle: () => void,
onImageDeleted?: (image: ImageModel)=> void,
className?: string
}

const ModalEditImage = ({
  image, visible, onImageSaved, toggle, onImageDeleted, className,
}: Props) => {
  const modalLogic = useEditModalLogic(
    {
      toggleEditModal: toggle,
      saveFunc: imageProxy.updateImage,
      saveParams: [],
      onSavedCb: onImageSaved,
      deleteFunc: imageProxy.deleteImage,
      deleteParams: [image],
      onDeleteCallBack: onImageDeleted,
    },
  );

  return (
    <>
      <Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade>
        <ModalHeader toggle={modalLogic.cancel}>
          <FontAwesomeIcon icon={faEdit} />
          {' '}
          <FormattedMessage {...editImageMsg.modalImageEditTitle} />
        </ModalHeader>
        <ModalBody>
          {image !== undefined && <Img storage={storageService.getUserStorage()} src={image.url} style={{ width: '100%' }} alt={`${image.title} - ${image.description}`} loader={<span className="spinnerContainer"><Loading /></span>} />}
          {visible
                      && (
                      <MyForm id="imageEditForm" submit={modalLogic.handleSubmit} initialData={image}>
                        <MyInput name="title" label={editImageMsg.title} type="text" />
                        <MyInput name="description" label={editImageMsg.description} type="text" />
                      </MyForm>
                      )}
          <Alerts errors={modalLogic.alerts} />
        </ModalBody>
        <ModalFooter>
          <ActionButton type="submit" isActing={modalLogic.isSaving} form="imageEditForm" color="success" message={editImageMsg.save} />
          <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...editImageMsg.cancel} /></Button>
          <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...editImageMsg.delete} /></Button>
        </ModalFooter>
      </Modal>
      <ModalYesNoConfirmation
        visible={modalLogic.yesNoModalVisibility}
        toggle={modalLogic.toggleModalYesNoConfirmation}
        yes={modalLogic.yesDelete}
        isActing={modalLogic.isDeleting}
        no={modalLogic.toggleModalYesNoConfirmation}
        title={editImageMsg.imageDeleteTitle}
        message={editImageMsg.imageDeleteMessage}
        className="modal-dialog-centered"
      />
    </>
  );
};

export default ModalEditImage;
