import React from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';
import tasktablemsg from "./TaskTable.messages";
import { getContext, getTodoText, shorten } from './TaskHelper'; 

const getTrContext = (level) => "table-" + getContext(level)

const TaskLine = ({task, trStyle, onClick}) => {
	var shortenDescription = shorten(task.description.replace(/\n/g,'<br />'));
	var todoText = getTodoText(task)		
	var classNames = getTrContext(task.level) + " small";
		
	return(
		<tr style={trStyle} className={classNames} onClick={() => onClick() }>
			<td>{task.name}</td>
			<td>{todoText}</td>
			<td><div dangerouslySetInnerHTML={{ __html: shortenDescription }} /></td>
		</tr>
	);
}

export const TaskTable = ({tasks, changeCurrentTask, toggleModal, classNames}) => {
	var listLines = [];
	
	if(tasks){
		const trStyle = { cursor: 'pointer' };
	listLines = tasks.map((task) => {
		return(
			<CSSTransition key={task.id} in={true} timeout={500} classNames="tr">
				<TaskLine task={task} trStyle={trStyle} onClick={() => changeCurrentTask(task) } />
			</CSSTransition>
		);
	});
	}

	return (
		<div className={classNames}>
			<span className="mb-2"><b><FormattedMessage {...tasktablemsg.tasklistTitle} /></b>
			<Button color="primary" size="sm" className="float-right mb-2" onClick={() => toggleModal() }><FormattedMessage {...tasktablemsg.createbutton} /></Button></span>
			<Table responsive size="sm" hover>
				<thead className="thead-light">
					<tr>
						<th><FormattedMessage {...tasktablemsg.taskname} /></th>
						<th><FormattedMessage {...tasktablemsg.todo} /></th>
						<th><FormattedMessage {...tasktablemsg.taskdesc} /></th>
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