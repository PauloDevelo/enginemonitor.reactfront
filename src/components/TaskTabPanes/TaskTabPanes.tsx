import React, { useState, useCallback } from 'react';
import { Nav } from 'reactstrap';

import { defineMessages } from 'react-intl';
import classnames from 'classnames';
import TaskTable from '../TaskTable/TaskTable';
import EquipmentHistoryTable from '../EquipmentHistoryTable/EquipmentHistoryTable';
import MyNavItem from './MyNavItem';

import { TaskModel } from '../../types/Types';

import jsonMessages from './TaskTabPanes.messages.json';

const taskTabPanesMsg = defineMessages(jsonMessages);

type Props = {
    // eslint-disable-next-line react/require-default-props
    className?: string,
    // eslint-disable-next-line no-unused-vars
    changeCurrentTask: (task: TaskModel) => void,
};

const TaskTabPanes = ({ className, changeCurrentTask }: Props) => {
  const [activeTab, setActiveTab] = useState<'taskTable' | 'equipmentHistory'>('taskTable');

  const activeEquipmentHistory = useCallback(() => { setActiveTab('equipmentHistory'); }, []);
  const activeTaskTable = useCallback(() => { setActiveTab('taskTable'); }, []);

  return (
    <div className={className}>
      <Nav tabs>
        <MyNavItem className={classnames({ active: activeTab === 'taskTable' })} activeFunc={activeTaskTable} label={taskTabPanesMsg.taskTable} />
        <MyNavItem className={classnames({ active: activeTab === 'equipmentHistory' })} activeFunc={activeEquipmentHistory} label={taskTabPanesMsg.equipementHistory} />
      </Nav>
      {activeTab === 'taskTable' && (
      <TaskTable changeCurrentTask={changeCurrentTask} />
      )}
      {activeTab === 'equipmentHistory' && (
      <EquipmentHistoryTable />
      )}
    </div>
  );
};

export default React.memo(TaskTabPanes);
