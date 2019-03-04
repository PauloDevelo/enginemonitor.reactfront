import React from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { faTasks, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';

import TaskRow from './TaskRow';

import taskTableMsg from "./TaskTable.messages";

export const TaskTable = ({tasks, changeCurrentTask, toggleModal, classNames}) => {
	var listLines = [];
	if(tasks){
		const trStyle = { cursor: 'pointer' };
		listLines = tasks.map((task) => {
			return(
				<CSSTransition key={task._id} in={true} timeout={500} classNames="tr">
					<TaskRow task={task} trStyle={trStyle} onClick={() => changeCurrentTask(task) } />
				</CSSTransition>
			);
		});
	}

	return (
		<div className={classNames}>
			<span className="mb-2"><FontAwesomeIcon icon={faTasks} />{' '}<b><FormattedMessage {...taskTableMsg.tasklistTitle} /></b>
			<Button color="light" size="sm" className="float-right mb-2" onClick={() => toggleModal() }><FontAwesomeIcon icon={faPlusSquare} /></Button></span>
			<Table responsive size="sm" hover>
				<thead className="thead-light">
					<tr>
						<th><FormattedMessage {...taskTableMsg.taskname} /></th>
						<th><FormattedMessage {...taskTableMsg.todo} /></th>
						<th><FormattedMessage {...taskTableMsg.taskdesc} /></th>
					</tr>
				</thead>
				<TransitionGroup component="tbody">
					{listLines}
				</TransitionGroup>
			</Table>
		</div>
	);
}

TaskTable.propTypes = {
	tasks: PropTypes.array.isRequired,
	changeCurrentTask: PropTypes.func.isRequired,
	toggleModal: PropTypes.func.isRequired,
	classNames: PropTypes.string
};

export default TaskTable;