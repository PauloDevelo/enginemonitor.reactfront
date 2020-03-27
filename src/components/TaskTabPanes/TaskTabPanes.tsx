import React, { useState, useEffect, useCallback } from 'react';
import { Nav } from 'reactstrap';

import { defineMessages } from 'react-intl';
import classnames from 'classnames';
import TaskTable from '../TaskTable/TaskTable';
import EquipmentHistoryTable from '../EquipmentHistoryTable/EquipmentHistoryTable';
import MyNavItem from './MyNavItem';

// eslint-disable-next-line no-unused-vars
import { TaskModel } from '../../types/Types';

import jsonMessages from './TaskTabPanes.messages.json';

const taskTabPanesMsg = defineMessages(jsonMessages);

type Props = {
    classNames?: string,
    changeCurrentTask: (task: TaskModel) => void,
};

const TaskTabPanes = ({ classNames, changeCurrentTask }: Props) => {
  const [activeTab, setActiveTab] = useState<'taskTable' | 'equipmentHistory'>('taskTable');
  const [equipmentHistoryClassNames, setEquipmentHistoryClassNames] = useState(classnames({ active: activeTab === 'equipmentHistory' }));
  const [taskTableClassNames, setTaskTableClassNames] = useState(classnames({ active: activeTab === 'taskTable' }));

  useEffect(() => {
    setEquipmentHistoryClassNames(classnames({ active: activeTab === 'equipmentHistory' }));
    setTaskTableClassNames(classnames({ active: activeTab === 'taskTable' }));
  }, [activeTab]);

  const activeEquipmentHistory = useCallback(() => { setActiveTab('equipmentHistory'); }, []);
  const activeTaskTable = useCallback(() => { setActiveTab('taskTable'); }, []);

  return (
    <div className={classNames}>
      <Nav tabs>
        <MyNavItem classNames={taskTableClassNames} activeFunc={activeTaskTable} label={taskTabPanesMsg.taskTable} />
        <MyNavItem classNames={equipmentHistoryClassNames} activeFunc={activeEquipmentHistory} label={taskTabPanesMsg.equipementHistory} />
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
