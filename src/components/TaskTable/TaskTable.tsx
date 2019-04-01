import React, {Fragment} from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { faTasks, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import PropTypes from 'prop-types';

import { useEditModal } from '../../hooks/EditModalHook';

import Loading from '../Loading/Loading';
import ModalEditTask from '../ModalEditTask/ModalEditTask';
import TaskRow from './TaskRow';

import { createDefaultTask } from '../../helpers/TaskHelper'

import taskTableMsg from "./TaskTable.messages";
import { Equipment, Task } from '../../types/Types';

type Props = {
	equipment?: Equipment, 
	tasks: Task[], 
	areTasksLoading: boolean, 
	onTaskSaved: (task: Task) => void, 
	changeCurrentTask: (task: Task) => void, 
	classNames: string
}

export const TaskTable = ({equipment, tasks, areTasksLoading, onTaskSaved, changeCurrentTask, classNames}: Props) => {
	const modalHook = useEditModal(undefined);

	let listLines:JSX.Element[] = [];
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
		<Fragment>
			<div className={classNames}>
				<span className="mb-2"><FontAwesomeIcon icon={faTasks} />{' '}<b><FormattedMessage {...taskTableMsg.tasklistTitle} /></b>
					{equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultTask()) }><FontAwesomeIcon icon={faPlusSquare} /></Button>}
				</span>
				{areTasksLoading ? <Loading/>:
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
				}
				
			</div>
			{equipment !== undefined && <ModalEditTask  equipment={equipment}
							task={modalHook.data}
							onTaskSaved={onTaskSaved} 
							visible={modalHook.editModalVisibility} 
							toggle={modalHook.toggleModal}
							className='modal-dialog-centered'/>}
		</Fragment>
	);
}

TaskTable.propTypes = {
	equipment: PropTypes.object,
	tasks: PropTypes.array.isRequired,
	onTaskSaved: PropTypes.func.isRequired,
	changeCurrentTask: PropTypes.func.isRequired,
	classNames: PropTypes.string,
	areTasksLoading: PropTypes.bool.isRequired
};

export default TaskTable;