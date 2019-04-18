import React, {Fragment, useRef, useEffect, forwardRef} from 'react';
import { Button, Badge } from 'reactstrap';
import { 
  composeDecorators,
  withInMemorySortingContext,
  withFixedHeader,
  withHeaderControl,
} from 'react-table-factory';

import { FormattedMessage } from 'react-intl';
import { faTasks, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ModalEditTask from '../ModalEditTask/ModalEditTask';
import Loading from '../Loading/Loading'

import { getContext, getTodoText, shorten, getTodoValue, TaskTodo, createDefaultTask, getBadgeText } from '../../helpers/TaskHelper'; 
import { useEditModal } from '../../hooks/EditModalHook';
import taskTableMsg from "./TaskTable.messages";

import PropTypes from 'prop-types';
import { Equipment, Task } from '../../types/Types';

import './TaskTable.css'
import './Table.scss';

type Props = {
	equipment?: Equipment, 
	tasks: Task[], 
	areTasksLoading: boolean, 
	onTaskSaved: (task: Task) => void, 
	changeCurrentTask: (task: Task) => void, 
	classNames: string
}

type DisplayableTask = {
		task: Task,
    name: string,
    todo: TaskTodo,
    shortenDescription: string,
		level: number,
		initialIndex: number
}

const Table = composeDecorators(
  withHeaderControl,
  
  withInMemorySortingContext({
    defaultDirection: 'desc'
  }),
  withFixedHeader // should be last
)()

export const TaskTable = ({equipment, tasks, areTasksLoading, onTaskSaved, changeCurrentTask, classNames}: Props) => {
	const modalHook = useEditModal<Task | undefined>(undefined);
	
	let tasksData:DisplayableTask[] = [];
	if(tasks){
		tasksData = tasks.map((task, index) => {
			return {
								task: task,
                name: task.name,
                todo: getTodoValue(task),
                shortenDescription: shorten(task.description),
								level: task.level,
								initialIndex: index
            };
		});
	}

	const innerTaskCell = (task:DisplayableTask, content: JSX.Element, classNames?: string) => {
		classNames = classNames === undefined ? '' : classNames;
		classNames += ' table-' + getContext(task.level);
		return (
			<div onClick={() => changeCurrentTask(task.task)} className={classNames + ' innerTd clickable'} >
				{content}
			</div>
		);
	}

	const columns = [
		{
			name: 'name',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...taskTableMsg.taskname} />
				</div>
			),
			cell: (content: any) => {
				return innerTaskCell(content.data, <span>{content.data.name}</span>);
			},
			style: {width: '25%'},
			sortable: true,
			removeAdaptiveColname: true
		},
		{
			name: 'initialIndex',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...taskTableMsg.status} />
				</div>
			),
			cell: (content: any) => {
				return innerTaskCell(content.data, <Badge color={getContext(content.data.level)} pill className={'mx-auto my-auto'}>{getBadgeText(content.data.level)} </Badge>, 'd-flex');
			},
			style: { 'min-width': '75px' },
			sortable: true,
			removeAdaptiveColname: true
		},
		{
			name: 'todo',
			header: () => (
				<div className={'text-center innerTdHead'}>
					<FormattedMessage {...taskTableMsg.todo}/>
				</div>
			),
			cell: (content: any) => {
				return innerTaskCell(content.data, getTodoText(content.data.todo));
			},
			style: {width: '25%'},
			sortable: false,
			removeAdaptiveColname: true
		},
		{
			name: 'description',
			header: () => (
				<div className={'text-center innerTdHead'}>
					<FormattedMessage {...taskTableMsg.taskdesc} />
				</div>
			),
			cell: (content: any) => {
				return innerTaskCell(content.data, <span>{content.data.shortenDescription}</span>);
			},
			style: {width: '50%'},
			sortable: false,
			removeAdaptiveColname: false
		}
	];

	return (
		<Fragment>
			<div className={classNames + ' tasktable'}>
				<span className=""><FontAwesomeIcon icon={faTasks} />{' '}<b><FormattedMessage {...taskTableMsg.tasklistTitle} /></b>
					{equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultTask()) }><FontAwesomeIcon icon={faPlusSquare} /></Button>}
				</span>
				{areTasksLoading ? <Loading/> :
				<Table
          data={tasksData}
          className="default-theme"
          defaultSortParameter="todo"
          defaultSortDirection="asc"
          columns={columns}
        />}

			</div>
			{equipment !== undefined && modalHook.data !== undefined && <ModalEditTask  equipment={equipment}
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