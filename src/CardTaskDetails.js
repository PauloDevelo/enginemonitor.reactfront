import React from 'react';
import { 
    Button, 
	Card,
	CardBody,
	CardTitle,
	CardSubtitle,
	CardFooter,
	CardText,
	Badge
} from 'reactstrap';

import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

import { getContext, getScheduleText } from './TaskHelper'; 

import edittaskmsg from "./ModalEditTask.messages";

import './CardTaskDetails.css';

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

const CardTaskDetails = ({task, next, prev, toggleModal, nextVisibility, prevVisibility, toggleAckModal, classNames}) => {
    if (task === undefined){
        return <Card className="p-2 m-2 border border-primary rounded shadow"/>;
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

    return(<Card className={classNames}>
            <CardBody className="d-flex p-0">
                    <div className="p-2" onClick={prev} style={cursorPointerStyle}><div className={prevClassNames}></div></div>
                    <div className="p-2 flex-grow-1">
                        <CardTitle>{task.name} <Badge color={badgeContext} pill>{badgeText}</Badge></CardTitle>
                        <CardSubtitle>{title}</CardSubtitle>
                        <CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }}></CardText>
                    </div>
                    <div className="p-2" onClick={next} style={cursorPointerStyle}><div className={nextClassNames}></div></div>
            </CardBody>
            <CardFooter className='pl-5 pr-5'>
                <Button color='primary' className='float-left' onClick={toggleModal}><FormattedMessage {...edittaskmsg.edit} /></Button>
                <Button color='primary' className='float-right' onClick={toggleAckModal}><FormattedMessage {...edittaskmsg.ack} /></Button>
            </CardFooter>
        </Card>
    );
}

CardTaskDetails.propTypes = {
    toggleModal: PropTypes.func.isRequired,
    next: PropTypes.func.isRequired,
    nextVisibility: PropTypes.bool.isRequired,
    prev: PropTypes.func.isRequired,
    prevVisibility: PropTypes.bool.isRequired,
    task: PropTypes.object,
    toggleAckModal: PropTypes.func.isRequired,
    classNames: PropTypes.string
};

export default CardTaskDetails;