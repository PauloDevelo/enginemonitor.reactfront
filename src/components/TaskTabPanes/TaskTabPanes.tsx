import React, {useState, useEffect, useCallback} from 'react';
import { Nav } from 'reactstrap';

import TaskTable from '../TaskTable/TaskTable';
import EquipmentHistoryTable from '../EquipmentHistoryTable/EquipmentHistoryTable';
import MyNavItem from './MyNavItem';
import { defineMessages } from 'react-intl';

import { EquipmentModel, TaskModel } from '../../types/Types';

import classnames from 'classnames';

import jsonMessages from "./TaskTabPanes.messages.json";
const taskTabPanesMsg = defineMessages(jsonMessages);

type Props = {
    classNames: string,
    currentEquipment: EquipmentModel | undefined,
    taskList: TaskModel[],
    areTasksLoading: boolean,
    changeCurrentTask: (task: TaskModel) => void,
    equipmentHistoryRefreshId: number,
    onTaskChanged: (task: TaskModel) => void
};

const TaskTabPanes = ({ classNames, currentEquipment, taskList, areTasksLoading, changeCurrentTask, equipmentHistoryRefreshId, onTaskChanged }: Props) => {
    const [activeTab, setActiveTab] = useState<"taskTable" | "equipmentHistory">("taskTable");
	const [equipmentHistoryClassNames, setEquipmentHistoryClassNames] = useState(classnames({ active: activeTab === 'equipmentHistory' }));
    const [taskTableClassNames, setTaskTableClassNames] = useState(classnames({ active: activeTab === 'taskTable' }));
    
    useEffect(() => {
		setEquipmentHistoryClassNames(classnames({ active: activeTab === 'equipmentHistory' }));
		setTaskTableClassNames(classnames({ active: activeTab === 'taskTable' }));
    }, [activeTab]);
    
    const activeEquipmentHistory = useCallback(() => { setActiveTab('equipmentHistory') }, []);
    const activeTaskTable = useCallback(() => { setActiveTab('taskTable') }, []);
    
    const onTaskChangedByTaskId = useCallback((taskId: string) => {
        const task = taskList.find(task => task._uiId === taskId);
        if (task){
            onTaskChanged(task);
        }
    }, [taskList, onTaskChanged]);

    return <div className={classNames}>
        <Nav tabs>
            <MyNavItem classNames={taskTableClassNames} activeFunc={activeTaskTable} label={taskTabPanesMsg.taskTable} />
            <MyNavItem classNames={equipmentHistoryClassNames} activeFunc={activeEquipmentHistory} label={taskTabPanesMsg.equipementHistory} />
        </Nav>
        {activeTab === "taskTable" && <TaskTable 	equipment={currentEquipment}
            areTasksLoading={areTasksLoading}
            tasks={taskList} 
            onTaskSaved={onTaskChanged}
            changeCurrentTask={changeCurrentTask} />}
        {activeTab === "equipmentHistory" && <EquipmentHistoryTable equipment={currentEquipment}
                equipmentHistoryRefreshId={equipmentHistoryRefreshId}												
                onTaskChanged={onTaskChangedByTaskId} />}
    </div>
} 

export default React.memo(TaskTabPanes);