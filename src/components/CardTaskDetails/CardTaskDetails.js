import React, {Fragment, useEffect} from 'react';
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardText, Badge } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';

import { useEditModal } from '../../hooks/EditModalHook';

import { getContext, getScheduleText } from '../../helpers/TaskHelper'; 

import ModalEditTask from '../ModalEditTask/ModalEditTask';

import './CardTaskDetails.css';
import '../../style/transition.css';

function getBadgeText(level){
	if(level === 1){
		return 'Done'
	}
	else if(level === 2){
		return 'Soon'
	}
	else{
		return 'Todo'
	}
}

const CardTaskDetails = ({equipment, tasks, currentTask, onTaskChanged, onTaskDeleted, changeCurrentTask, classNames}) => {
    const modalHook = useEditModal(currentTask);

    const getFirstTask = () =>{
        if (tasks === undefined || tasks.length === 0){
            return undefined;
        }
        else{
            return tasks[0];
        }
    }

    const getTaskIndex = (task) => {
        return task === undefined ? -1 : tasks.findIndex(t => t._id === task._id);
    }

    let taskIndex = getTaskIndex(currentTask);
    
    useEffect(() => {
        if(currentTask === undefined){
            changeCurrentTask(getFirstTask());
        }
    }, [tasks]);

    if (currentTask === undefined){
        return <Card className={classNames}/>;
    }

    const isPrevButtonVisible = () => (taskIndex > 0);
    const isNextButtonVisible = () => (taskIndex < tasks.length - 1);

    const nextTask = () => {
        if(isNextButtonVisible())
            changeCurrentTask(tasks[taskIndex + 1]);
    };
	const previousTask = () => {
        if(isPrevButtonVisible())
            changeCurrentTask(tasks[taskIndex - 1]);
    }

    const cursorPointerStyle = { cursor: 'pointer' };
    var badgeText = getBadgeText(currentTask.level);
    var badgeContext = getContext(currentTask.level);
    var title = getScheduleText(currentTask);
    var descriptionFormatted = currentTask.description.replace(/\n/g,"<br />");

    var prevClassNames = "card-control-prev-icon";
    if(!isPrevButtonVisible())
        prevClassNames += ' invisible';

    var nextClassNames = "card-control-next-icon";
    if(!isNextButtonVisible())
        nextClassNames += ' invisible';

    return(
        <Fragment>
            <Card className={classNames}>        
                <CardBody className="d-flex p-0">
                        <div className="p-2" onClick={previousTask} style={cursorPointerStyle}><div className={prevClassNames}></div></div>
                        <TransitionGroup className="p-2 flex-grow-1">
                            <CSSTransition key={currentTask._id} timeout={250} classNames="card" >
                                <div >
                                    <CardTitle>{currentTask.name} <Badge color={badgeContext} pill>{badgeText}</Badge></CardTitle>
                                    <CardSubtitle>{title}</CardSubtitle>
                                    <CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }}></CardText>
                                </div>
                            </CSSTransition>
                        </TransitionGroup>
                        <div className="p-2" onClick={nextTask} style={cursorPointerStyle}><div className={nextClassNames}></div></div>
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