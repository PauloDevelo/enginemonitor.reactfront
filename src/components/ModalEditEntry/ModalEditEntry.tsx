import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import entryProxy from '../../services/EntryProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';
import Gallery from '../Gallery/Gallery';

import {
  // eslint-disable-next-line no-unused-vars
  EntityModel, EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType,
} from '../../types/Types';

import jsonMessages from './ModalEditEntry.messages.json';

const editEntryMsg = defineMessages(jsonMessages);

type Props = {
equipment: EquipmentModel;
task?: TaskModel;
entry: EntryModel;
visible: boolean;
className?: string;
saveEntry: (entry: EntryModel) => void;
deleteEntry?: (entry: EntryModel) => void;
toggle: ()=>void;
}

const getEntityId = (entity: EntityModel | undefined) => (entity === undefined ? undefined : entity._uiId);

const ModalTitle = ({ isNewEntry }:{isNewEntry: boolean}) => {
  if (isNewEntry) {
    return <FormattedMessage {...editEntryMsg.modalAckTitle} />;
  }

  return <FormattedMessage {...editEntryMsg.modalEditEntryTitle} />;
};

const ModalEditEntry = ({
  equipment, task, entry, visible, className, saveEntry, deleteEntry, toggle,
}: Props) => {
  const [equipmentId, setEquipmentId] = useState(getEntityId(equipment));
  useEffect(() => {
    setEquipmentId(getEntityId(equipment));
  }, [equipment]);

  const [taskId, setTaskId] = useState(getEntityId(task));
  useEffect(() => {
    setTaskId(getEntityId(task));
  }, [task]);

  const [entryId, setEntryId] = useState(getEntityId(entry));
  useEffect(() => {
    setEntryId(getEntityId(entry));
  }, [entry]);

  const [isNewEntry, setIsNewEntry] = useState(false);

  useEffect(() => {
    if (equipmentId) {
      entryProxy.existEntry(equipmentId, entryId).then((isEntryExist) => {
        setIsNewEntry(isEntryExist === false);
      });
    }
  }, [equipmentId, entryId]);

  const onSavedEntryCb = (entrySaved: EntryModel) => {
    setIsNewEntry(false);
    saveEntry(entrySaved);
  };

  const modalLogic = useEditModalLogic<EntryModel>(
    {
      toggleEditModal: toggle,
      saveFunc: entryProxy.createOrSaveEntry,
      saveParams: [equipmentId, taskId],
      onSavedCb: onSavedEntryCb,
      deleteFunc: entryProxy.deleteEntry,
      deleteParams: [equipmentId, taskId, entryId],
      onDeleteCallBack: deleteEntry,
    },
  );

  return (
    <>
      <Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade>
        <ModalHeader toggle={modalLogic.cancel}>
          <FontAwesomeIcon icon={faCheckSquare} size="lg" />
          {' '}
          <ModalTitle isNewEntry={isNewEntry} />
        </ModalHeader>
        <ModalBody>
          {visible && (
          <MyForm id="editEntryForm" submit={modalLogic.handleSubmit} initialData={entry}>
            {task !== undefined && <MyInput name="ack" label={editEntryMsg.ackOption} type="checkbox" />}
            <MyInput name="name" label={editEntryMsg.name} type="text" required />
            <MyInput name="date" label={editEntryMsg.date} type="date" required />
            {equipment.ageAcquisitionType !== AgeAcquisitionType.time && <MyInput name="age" label={editEntryMsg.age} type="number" min={0} required />}
            <MyInput name="remarks" label={editEntryMsg.remarks} type="textarea" required />
          </MyForm>
          )}
          <Gallery parentUiId={entry._uiId} />
          <Alerts errors={modalLogic.alerts} />
        </ModalBody>
        <ModalFooter>
          <ActionButton type="submit" form="editEntryForm" color="success" isActing={modalLogic.isSaving} message={editEntryMsg.save} />
          <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...editEntryMsg.cancel} /></Button>
          {entry && !isNewEntry && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...editEntryMsg.delete} /></Button>}
        </ModalFooter>
      </Modal>
      <ModalYesNoConfirmation
        visible={modalLogic.yesNoModalVisibility}
        toggle={modalLogic.toggleModalYesNoConfirmation}
        yes={modalLogic.yesDelete}
        isActing={modalLogic.isDeleting}
        no={modalLogic.toggleModalYesNoConfirmation}
        title={editEntryMsg.entryDeleteTitle}
        message={editEntryMsg.entryDeleteMsg}
        className="modal-dialog-centered"
      />
    </>
  );
};

export default ModalEditEntry;
