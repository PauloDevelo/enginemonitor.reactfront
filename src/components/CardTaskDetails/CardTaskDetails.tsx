/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-use-before-define
import React, { useCallback, useState, useEffect } from 'react';
import {
  Button, Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardText, Badge,
} from 'reactstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import classnames from 'classnames';
import useEditModal from '../../hooks/EditModalHook';

import { getContext, getBadgeText, getTodoValue } from '../../helpers/TaskHelper';

import TaskScheduleText from '../TaskScheduleText/TaskScheduleText';
import ModalEditTask from '../ModalEditTask/ModalEditTask';
import Gallery from '../Gallery/Gallery';

import './CardTaskDetails.css';
import '../../style/transition.css';
import taskManager from '../../services/TaskManager';
import equipmentManager from '../../services/EquipmentManager';
import ToDoText from '../ToDoText/TodoText';

// eslint-disable-next-line no-unused-vars
import { TaskTodo } from '../../types/Types';

type Props = {
    callBackRef: (t: any) => any,
    // eslint-disable-next-line react/require-default-props
    className?: string
}

const CardTaskDetails = ({ callBackRef, className }: Props) => {
  const [equipment, setEquipment] = useState(equipmentManager.getCurrentEquipment());
  const [currentTask, setCurrentTask] = useState(taskManager.getCurrentTask());
  const [todoTask, setTodoTask] = useState<TaskTodo | undefined>(equipment === undefined || currentTask === undefined ? undefined : getTodoValue(equipment, currentTask));
  const [tasks, setTasks] = useState(taskManager.getTasks());

  useEffect(() => {
    if (equipment === undefined || currentTask === undefined) {
      setTodoTask(undefined);
    } else {
      setTodoTask(getTodoValue(equipment, currentTask));
    }
  }, [equipment, currentTask]);

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
    return <Card className={className} />;
  }

  const badgeText = getBadgeText(currentTask.level);
  const badgeContext = getContext(currentTask.level);
  const descriptionFormatted = currentTask.description.replace(/\n/g, '<br />');

  const prevClassNames = { 'card-control-prev-icon': true, invisible: !isPrevButtonVisible() };
  const nextClassNames = { 'card-control-next-icon': true, invisible: !isNextButtonVisible() };

  return (
    <div ref={callBackRef}>
      <Card className={classnames(className, { hover: taskManager.isCurrentTaskChanging() })}>
        <CardBody className="d-flex p-0">
          <div className="p-2 button-previous-task clickable" onClick={previousTask}><div className={classnames(prevClassNames)} /></div>
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
          <div className="p-2 button-next-task clickable" onClick={nextTask}><div className={classnames(nextClassNames)} /></div>
        </CardBody>
        <CardFooter className="pl-5 pr-5">
          <Button color="light" className="float-left" onClick={modalHook.toggleModal} aria-label="Edit"><FontAwesomeIcon icon={faEdit} /></Button>
          {todoTask && <ToDoText className="float-right" dueDate={todoTask.dueDate} level={todoTask.level} onlyDate={todoTask.onlyDate} usageInHourLeft={todoTask.usageInHourLeft} />}
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
