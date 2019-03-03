import React from 'react';
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardText, Badge } from 'reactstrap';
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';

import { getContext, getScheduleText } from '../../helpers/TaskHelper'; 

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

const CardTaskDetails = ({task, next, prev, toggleModal, nextVisibility, prevVisibility, classNames}) => {
    if (task === undefined){
        return <Card className={classNames}/>;
    }

    const cursorPointerStyle = {
        cursor: 'pointer',
    };

    var badgeText = getBadgeText(task.level);
    var badgeContext = getContext(task.level);

    var title = getScheduleText(task);

    var descriptionFormatted = task.description.replace(/\n/g,"<br />");

    var prevClassNames = "card-control-prev-icon";
    if(!prevVisibility)
        prevClassNames += ' invisible';

    var nextClassNames = "card-control-next-icon";
    if(!nextVisibility)
        nextClassNames += ' invisible';

    return(
        <Card className={classNames}>        
            <CardBody className="d-flex p-0">
                    <div className="p-2" onClick={prev} style={cursorPointerStyle}><div className={prevClassNames}></div></div>
                        <TransitionGroup className="p-2 flex-grow-1">
                            <CSSTransition key={task._id} timeout={250} classNames="card" >
                                <div >
                                    <CardTitle>{task.name} <Badge color={badgeContext} pill>{badgeText}</Badge></CardTitle>
                                    <CardSubtitle>{title}</CardSubtitle>
                                    <CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }}></CardText>
                                </div>
                            </CSSTransition>
                        </TransitionGroup>
                    <div className="p-2" onClick={next} style={cursorPointerStyle}><div className={nextClassNames}></div></div>
            </CardBody>
            <CardFooter className='pl-5 pr-5'>
                <Button color='light' className='float-left' onClick={toggleModal}><FontAwesomeIcon icon={faEdit} /></Button>
            </CardFooter>
        </Card>
    );
}

CardTaskDetails.propTypes = {
    task: PropTypes.object,
    next: PropTypes.func.isRequired,
    prev: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    nextVisibility: PropTypes.bool.isRequired,
    prevVisibility: PropTypes.bool.isRequired,
    classNames: PropTypes.string
};

export default CardTaskDetails;