import React, {Fragment, useEffect} from 'react';
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardText, Badge } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';

import { useEditModal } from '../../hooks/EditModalHook';

import { getContext, getScheduleText, getBadgeText } from '../../helpers/TaskHelper'; 

import ModalEditTask from '../ModalEditTask/ModalEditTask';

import './CardTaskDetails.css';
import '../../style/transition.css';
import { Equipment, Task } from '../../types/Types';



type Props = {
    equipment?: Equipment, 
    tasks: Task[], 
    currentTask?: Task, 
    onTaskChanged: (task: Task) => void, 
    onTaskDeleted: (task: Task) => void, 
    changeCurrentTask: (task: Task | undefined) => void, 
    classNames?: string
}

const CardTaskDetails = ({equipment, tasks, currentTask, onTaskChanged, onTaskDeleted, changeCurrentTask, classNames}: Props) => {
    const modalHook = useEditModal(currentTask);

    const getFirstTask = ():Task | undefined =>{
        if (tasks === undefined || tasks.length === 0){
            return undefined;
        }
        else{
            return tasks[0];
        }
    }

    const getTaskIndex = (task: Task | undefined):number => {
        return task === undefined ? -1 : tasks.findIndex(t => t._id === task._id);
    }

    const taskIndex = getTaskIndex(currentTask);
    
    useEffect(() => {
        if(currentTask === undefined){
            const firstTask = getFirstTask();
            if(firstTask !== undefined){
                changeCurrentTask(firstTask);
            }
        }
    }, [tasks]);

    if (equipment === undefined || currentTask === undefined){
        return <Card className={classNames}/>;
    }

    const isPrevButtonVisible = ():boolean => (taskIndex > 0);
    const isNextButtonVisible = ():boolean => (taskIndex < tasks.length - 1);

    const nextTask = ():void => {
        if(isNextButtonVisible())
            changeCurrentTask(tasks[taskIndex + 1]);
    };
	const previousTask = ():void => {
        if(isPrevButtonVisible())
            changeCurrentTask(tasks[taskIndex - 1]);
    }

    const cursorPointerStyle = { cursor: 'pointer' };
    const badgeText = getBadgeText(currentTask.level);
    const badgeContext = getContext(currentTask.level);
    const title = getScheduleText(currentTask);
    const descriptionFormatted = currentTask.description.replace(/\n/g,"<br />");

    let prevClassNames = "card-control-prev-icon";
    if(!isPrevButtonVisible())
        prevClassNames += ' invisible';

    let nextClassNames = "card-control-next-icon";
    if(!isNextButtonVisible())
        nextClassNames += ' invisible';

    return(
        <Fragment>
            <Card className={classNames}>        
                <CardBody className="d-flex p-0">
                        <div className="p-2 button-previous-task" onClick={previousTask} style={cursorPointerStyle}><div className={prevClassNames}></div></div>
                        <TransitionGroup className="p-2 flex-grow-1">
                            <CSSTransition key={currentTask._id} timeout={250} classNames="card" >
                                <div >
                                    <CardTitle>{currentTask.name} <Badge color={badgeContext} pill>{badgeText}</Badge></CardTitle>
                                    <CardSubtitle>{title}</CardSubtitle>
                                    <CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }}></CardText>
                                </div>
                            </CSSTransition>
                        </TransitionGroup>
                        <div className="p-2 button-next-task" onClick={nextTask} style={cursorPointerStyle}><div className={nextClassNames}></div></div>
                </CardBody>
                <CardFooter className='pl-5 pr-5'>
                    <Button color='light' className='float-left' onClick={modalHook.toggleModal}><FontAwesomeIcon icon={faEdit} /></Button>
                </CardFooter>
            </Card>

            <ModalEditTask  equipment={equipment}
                            task={currentTask}
                            onTaskSaved={onTaskChanged} 
                            onTaskDeleted={onTaskDeleted}
                            visible={modalHook.editModalVisibility} 
                            toggle={modalHook.toggleModal} 
                            className='modal-dialog-centered'/>
        </Fragment>
    );
}

CardTaskDetails.propTypes = {
    equipment: PropTypes.object,
    tasks: PropTypes.array,
    currentTask: PropTypes.object,
    onTaskChanged: PropTypes.func.isRequired,
    onTaskDeleted: PropTypes.func.isRequired,
    changeCurrentTask: PropTypes.func.isRequired,
    classNames: PropTypes.string
};

export default CardTaskDetails;