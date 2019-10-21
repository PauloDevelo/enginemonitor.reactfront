import React, {Fragment} from 'react';
import { Button, Badge } from 'reactstrap';
import { 
  composeDecorators,
  withInMemorySortingContext,
  withFixedHeader,
  withHeaderControl,
} from 'react-table-factory';

import { FormattedMessage, defineMessages } from 'react-intl';
import { faTasks, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ModalEditTask from '../ModalEditTask/ModalEditTask';
import Loading from '../Loading/Loading';

import { getContext, getTodoText, shorten, getTodoValue, TaskTodo, createDefaultTask, getBadgeText } from '../../helpers/TaskHelper'; 
import { useEditModal } from '../../hooks/EditModalHook';

import PropTypes from 'prop-types';
import { EquipmentModel, TaskModel } from '../../types/Types';

import '../../style/Table.scss';
import './TaskTable.css';

import jsonMessages from "./TaskTable.messages.json";
const taskTableMsg = defineMessages(jsonMessages);

type Props = {
	equipment?: EquipmentModel, 
	tasks: TaskModel[], 
	areTasksLoading: boolean, 
	onTaskSaved: React.MutableRefObject<(task: TaskModel) => void>, 
	changeCurrentTask: (task: TaskModel) => void, 
	classNames?: string
};

type DisplayableTask = {
	task: TaskModel,
    name: string,
    todo: TaskTodo,
    shortenDescription: string,
	level: number,
	initialIndex: number
};

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader // should be last
)();

export const TaskTable = ({equipment, tasks, areTasksLoading, onTaskSaved, changeCurrentTask, classNames}: Props) => {
	classNames = classNames === undefined ? 'tasktable' : classNames + ' tasktable';
	const modalHook = useEditModal<TaskModel | undefined>(undefined);
	
	let tasksData:DisplayableTask[] = [];
	if(tasks && equipment){
		tasksData = tasks.map((task, index) => {
			return {
				task: task,
        name: task.name,
        todo: getTodoValue(equipment, task),
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
			sortable: true
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
			sortable: true
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
			sortable: false
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
			sortable: false
		}
	];

	return (
		<Fragment>
			<div className={classNames}>
				<span><FontAwesomeIcon icon={faTasks} />{' '}<b><FormattedMessage {...taskTableMsg.tasklistTitle} /></b>
					{equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultTask(equipment)) } aria-label="Add"><FontAwesomeIcon icon={faPlusSquare} /></Button>}
				</span>
				{areTasksLoading ? <Loading/> :
				<Table
					data={tasksData}
					className="default-theme"
					defaultSortParameter="status"
					defaultSortDirection="desc"
					columns={columns}
				/>}

			</div>
			{equipment !== undefined && modalHook.data !== undefined && <ModalEditTask  equipment={equipment}
							task={modalHook.data}
							onTaskSaved={onTaskSaved.current} 
							visible={modalHook.editModalVisibility} 
							toggle={modalHook.toggleModal}
							className='modal-dialog-centered'/>}
		</Fragment>
	);
}

TaskTable.propTypes = {
	equipment: PropTypes.object,
	tasks: PropTypes.array.isRequired,
	onTaskSaved: PropTypes.object.isRequired,
	changeCurrentTask: PropTypes.func.isRequired,
	classNames: PropTypes.string,
	areTasksLoading: PropTypes.bool.isRequired
};

export default React.memo(TaskTable);