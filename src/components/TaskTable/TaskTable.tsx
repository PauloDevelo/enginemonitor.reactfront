import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button, Badge } from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';
import { faTasks, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';
import { composeDecorators } from '../react-table-factory/table.js';
import { withInMemorySortingContext } from '../react-table-factory/withSortingContext.js';
import { withHeaderControl } from '../react-table-factory/withHeaderControl.js';
import { withFixedHeader } from '../react-table-factory/withFixedHeader.js';

import ModalEditTask from '../ModalEditTask/ModalEditTask';
import Loading from '../Loading/Loading';

import {
  getContext, shorten, getTodoValue, createDefaultTask, getBadgeText,
} from '../../helpers/TaskHelper';

import ToDoText from '../ToDoText/TodoText';

import useEditModal from '../../hooks/EditModalHook';

import {
  EquipmentModel, TaskModel, TaskLevel, TaskTodo,
} from '../../types/Types';

import '../../style/Table.scss';
import './TaskTable.css';

import jsonMessages from './TaskTable.messages.json';
import ClickableCell from '../Table/ClickableCell';

import taskManager from '../../services/TaskManager';
import equipmentManager from '../../services/EquipmentManager';

const taskTableMsg = defineMessages(jsonMessages);

type Props = {
  // eslint-disable-next-line no-unused-vars
  changeCurrentTask: (task: TaskModel) => void,
  // eslint-disable-next-line react/require-default-props
  className?: string
};

type DisplayableTask = {
  task: TaskModel,
  name: string,
  todo: TaskTodo,
  shortenDescription: string,
  level: TaskLevel,
  initialIndex: number
};

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

export const TaskTable = ({ className, changeCurrentTask }: Props) => {
  const [equipment, setEquipment] = useState<EquipmentModel | undefined>(equipmentManager.getCurrentEquipment());
  const [tasks, setTasks] = useState<TaskModel[]>(taskManager.getTasks());

  const onClickTaskRow = useCallback((task: TaskModel) => {
    taskManager.setCurrentTask(task);
    changeCurrentTask(task);
  }, [changeCurrentTask]);

  useEffect(() => {
    equipmentManager.registerOnCurrentEquipmentChanged(setEquipment);
    taskManager.registerOnTasksChanged(setTasks);

    return () => {
      equipmentManager.unregisterOnCurrentEquipmentChanged(setEquipment);
      taskManager.unregisterOnTasksChanged(setTasks);
    };
  }, []);

  const modalHook = useEditModal<TaskModel | undefined>(undefined);

  const getTasksData = useCallback(() => {
    let tasksData: DisplayableTask[] = [];
    if (tasks && equipment) {
      tasksData = tasks.map((task, index) => ({
        task,
        name: task.name,
        todo: getTodoValue(equipment, task),
        shortenDescription: shorten(task.description),
        level: task.level,
        initialIndex: index,
      }));
    }

    return tasksData;
  }, [tasks, equipment]);

  const [columns, setColumns] = useState([
    {
      name: 'name',
      header: () => (
        <div className="innerTdHead">
          <FormattedMessage {...taskTableMsg.taskname} />
        </div>
      ),
      cell: (content: any) => {
        const { data }: { data: DisplayableTask} = content;
        return (
          <ClickableCell data={data.task} onDisplayData={onClickTaskRow} className={`table-${getContext(data.level)}`}>
            <span>{data.name}</span>
          </ClickableCell>
        );
      },
      sortable: true,
    },
    {
      name: 'initialIndex',
      header: () => (
        <div className="innerTdHead">
          <FormattedMessage {...taskTableMsg.status} />
        </div>
      ),
      cell: (content: any) => {
        const { data }: { data: DisplayableTask} = content;
        return (
          <ClickableCell data={data.task} onDisplayData={onClickTaskRow} className={`table-${getContext(data.level)} d-flex`}>
            <Badge color={getContext(data.level)} pill className="mx-auto my-auto">
              {getBadgeText(data.level)}
              {' '}
            </Badge>
          </ClickableCell>
        );
      },
      sortable: true,
    },
    {
      name: 'todo',
      header: () => (
        <div className="text-center innerTdHead">
          <FormattedMessage {...taskTableMsg.todo} />
        </div>
      ),
      cell: (content: any) => {
        const { data }: { data: DisplayableTask} = content;
        const { todo } = data;
        return (
          <ClickableCell data={data.task} onDisplayData={onClickTaskRow} className={`table-${getContext(data.level)}`}>
            <ToDoText dueDate={todo.dueDate} level={todo.level} onlyDate={todo.onlyDate} usageInHourLeft={todo.usageInHourLeft} />
          </ClickableCell>
        );
      },
      sortable: false,
    },
  ]);

  useEffect(() => {
    const onResize = () => {
      setColumns((previousColumns) => {
        if (window.innerWidth < 1200) {
          if (previousColumns.length !== 3) {
            const newColumns = previousColumns.concat([]);
            newColumns.length = 3;
            return newColumns;
          }
        } else if (previousColumns.length === 3) {
          return previousColumns.concat([{
            name: 'description',
            header: () => (
              <div className="text-center innerTdHead">
                <FormattedMessage {...taskTableMsg.taskdesc} />
              </div>
            ),
            cell: (content: any) => {
              const { data }: { data: DisplayableTask} = content;
              return (
                <ClickableCell data={data.task} onDisplayData={onClickTaskRow} className={`table-${getContext(data.level)}`}>
                  <span>{data.shortenDescription}</span>
                </ClickableCell>
              );
            },
            sortable: false,
          }]);
        }

        return previousColumns;
      });
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onClickTaskRow]);

  return (
    <>
      <div className={classnames(className, 'tasktable')}>
        <span>
          <FontAwesomeIcon icon={faTasks} />
          {' '}
          <b><FormattedMessage {...taskTableMsg.tasklistTitle} /></b>
          {equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultTask(equipment))} aria-label="Add"><FontAwesomeIcon icon={faPlusSquare} /></Button>}
        </span>
        {taskManager.areTasksLoading() ? <Loading />
          : (
            <Table
              data={getTasksData()}
              className="default-theme"
              defaultSortParameter="status"
              defaultSortDirection="desc"
              columns={columns}
            />
          )}
      </div>
      {equipment !== undefined && modalHook.data !== undefined && (
      <ModalEditTask
        equipment={equipment}
        task={modalHook.data}
        onTaskSaved={taskManager.onTaskSaved}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
      )}
    </>
  );
};

export default React.memo(TaskTable);
