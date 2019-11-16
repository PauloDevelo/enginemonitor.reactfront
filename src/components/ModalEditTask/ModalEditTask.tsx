import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';
import { CSSTransition } from 'react-transition-group';

import useEditModalLogic from '../../hooks/EditModalLogicHook';

import taskProxy from '../../services/TaskProxy';

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import '../../style/transition.css';
// eslint-disable-next-line no-unused-vars
import { EquipmentModel, TaskModel, AgeAcquisitionType } from '../../types/Types';

import jsonMessages from './ModalEditTask.messages.json';

const editTaskMsg = defineMessages(jsonMessages);

type Props = {
equipment: EquipmentModel,
task: TaskModel,
onTaskSaved: (task: TaskModel) => void,
toggle: () => void,
onTaskDeleted?: (task: TaskModel)=> void,
visible: boolean,
className?: string
}

const onSaveTask = (task: TaskModel): void => {
  // eslint-disable-next-line no-param-reassign
  task.usagePeriodInHour = task.usagePeriodInHour === undefined || task.usagePeriodInHour <= 0
    ? -1 : task.usagePeriodInHour;
};

const ModalEditTask = ({
  equipment, task, onTaskSaved, toggle, onTaskDeleted, visible, className,
}: Props) => {
  const modalLogic = useEditModalLogic(
    toggle,
    taskProxy.createOrSaveTask, [equipment._uiId], onSaveTask, onTaskSaved,
    taskProxy.deleteTask, [equipment._uiId, task._uiId], onTaskDeleted,
  );
  const [isCreation, setIsCreation] = useState(false);

  useEffect(() => {
    taskProxy.existTask(equipment._uiId, task._uiId).then((taskExist) => {
      setIsCreation(taskExist === false);
    });
  }, [task, equipment]);

  let title;
  if (isCreation) {
    title = <FormattedMessage {...editTaskMsg.modalCreationTaskTitle} />;
  } else {
    title = <FormattedMessage {...editTaskMsg.modalEditTaskTitle} />;
  }

  return (
    <>
      <CSSTransition in={visible} timeout={300} classNames="modal">
        <Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
          <ModalHeader toggle={modalLogic.cancel}>
            <FontAwesomeIcon icon={faEdit} />
            {' '}
            {title}
          </ModalHeader>
          <ModalBody>
            {visible && (
            <MyForm id="createTaskForm" submit={modalLogic.handleSubmit} initialData={task}>
              <MyInput name="name" label={editTaskMsg.name} type="text" required />
              {equipment.ageAcquisitionType !== AgeAcquisitionType.time && <MyInput name="usagePeriodInHour" label={editTaskMsg.usagePeriodInHour} type="number" min={0} />}
              <MyInput name="periodInMonth" label={editTaskMsg.month} type="number" min={1} required />
              <MyInput name="description" label={editTaskMsg.description} type="textarea" required />
            </MyForm>
            )}
            <Alerts errors={modalLogic.alerts} />
          </ModalBody>
          <ModalFooter>
            <ActionButton type="submit" isActing={modalLogic.isSaving} form="createTaskForm" color="success" message={editTaskMsg.save} />
            <Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...editTaskMsg.cancel} /></Button>
            {!isCreation && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...editTaskMsg.delete} /></Button>}
          </ModalFooter>
        </Modal>
      </CSSTransition>
      <ModalYesNoConfirmation
        visible={modalLogic.yesNoModalVisibility}
        toggle={modalLogic.toggleModalYesNoConfirmation}
        yes={modalLogic.yesDelete}
        isActing={modalLogic.isDeleting}
        no={modalLogic.toggleModalYesNoConfirmation}
        title={editTaskMsg.taskDeleteTitle}
        message={editTaskMsg.taskDeleteMsg}
        className="modal-dialog-centered"
      />
    </>
  );
};

export default ModalEditTask;
