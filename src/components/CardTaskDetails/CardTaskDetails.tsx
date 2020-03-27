import React, { useCallback, useState, useEffect } from 'react';
import {
  Button, Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardText, Badge,
} from 'reactstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import classnames from 'classnames';
import useEditModal from '../../hooks/EditModalHook';

import { getContext, getBadgeText } from '../../helpers/TaskHelper';

import TaskScheduleText from '../TaskScheduleText/TaskScheduleText';
import ModalEditTask from '../ModalEditTask/ModalEditTask';
import Gallery from '../Gallery/Gallery';

import './CardTaskDetails.css';
import '../../style/transition.css';
import taskManager from '../../services/TaskManager';
import equipmentManager from '../../services/EquipmentManager';

type Props = {
    callBackRef: (t: any) => any,
    classNames?: string
}

const CardTaskDetails = ({ callBackRef, classNames }: Props) => {
  const [equipment, setEquipment] = useState(equipmentManager.getCurrentEquipment());
  const [currentTask, setCurrentTask] = useState(taskManager.getCurrentTask());
  const [tasks, setTasks] = useState(taskManager.getTasks());

  useEffect(() => {
    equipmentManager.registerOnCurrentEquipmentChanged(setEquipment);
    taskManager.registerOnCurrentTaskChanged(setCurrentTask);
    taskManager.registerOnTasksChanged(setTasks);

    return () => {
      equipmentManager.unregisterOnCurrentEquipmentChanged(setEquipment);
      taskManager.unregisterOnCurrentTaskChanged(setCurrentTask);
      taskManager.unregisterOnTasksChanged(setTasks);
    };
  }, []);
  const modalHook = useEditModal(currentTask);

  const [taskIndex, setTaskIndex] = useState(currentTask === undefined ? -1 : tasks.findIndex((t) => t._uiId === currentTask._uiId));
  useEffect(() => {
    setTaskIndex(currentTask === undefined ? -1 : tasks.findIndex((t) => t._uiId === currentTask._uiId));
  }, [currentTask, tasks]);

  const isPrevButtonVisible = useCallback(():boolean => (taskIndex > 0), [taskIndex]);
  const isNextButtonVisible = useCallback(():boolean => (taskIndex < tasks.length - 1), [taskIndex, tasks]);

  const nextTask = useCallback(():void => {
    if (isNextButtonVisible()) { taskManager.setCurrentTask(tasks[taskIndex + 1]); }
  }, [isNextButtonVisible, taskIndex, tasks]);

  const previousTask = useCallback(():void => {
    if (isPrevButtonVisible()) { taskManager.setCurrentTask(tasks[taskIndex - 1]); }
  }, [isPrevButtonVisible, taskIndex, tasks]);

  if (equipment === undefined || currentTask === undefined) {
    return <Card className={classNames} />;
  }

  const badgeText = getBadgeText(currentTask.level);
  const badgeContext = getContext(currentTask.level);
  const descriptionFormatted = currentTask.description.replace(/\n/g, '<br />');

  let prevClassNames = 'card-control-prev-icon';
  if (!isPrevButtonVisible()) { prevClassNames += ' invisible'; }

  let nextClassNames = 'card-control-next-icon';
  if (!isNextButtonVisible()) { nextClassNames += ' invisible'; }

  return (
    <div ref={callBackRef}>
      <Card className={classnames(classNames, taskManager.isCurrentTaskChanging() ? 'hover' : undefined)}>
        <CardBody className="d-flex p-0">
          <div className="p-2 button-previous-task clickable" onClick={previousTask}><div className={prevClassNames} /></div>
          <TransitionGroup className="p-2 flex-grow-1">
            <CSSTransition key={currentTask._uiId} timeout={250} classNames="card">
              <div>
                <CardTitle>
                  {currentTask.name}
                  {' '}
                  <Badge color={badgeContext} pill>{badgeText}</Badge>
                </CardTitle>
                <CardSubtitle>
                  <TaskScheduleText equipment={equipment} task={currentTask} />
                </CardSubtitle>
                <CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }} />
                <Gallery parentUiId={currentTask._uiId} />
              </div>
            </CSSTransition>
          </TransitionGroup>
          <div className="p-2 button-next-task clickable" onClick={nextTask}><div className={nextClassNames} /></div>
        </CardBody>
        <CardFooter className="pl-5 pr-5">
          <Button color="light" className="float-left" onClick={modalHook.toggleModal} aria-label="Edit"><FontAwesomeIcon icon={faEdit} /></Button>
        </CardFooter>
      </Card>
      <ModalEditTask
        equipment={equipment}
        task={currentTask}
        onTaskSaved={taskManager.onTaskSaved}
        onTaskDeleted={taskManager.onTaskDeleted}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
    </div>
  );
};

export default React.memo(CardTaskDetails);
