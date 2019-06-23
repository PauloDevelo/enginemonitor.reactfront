import React, {useState, useEffect, useCallback, useRef} from 'react';
import { Nav, TabContent, TabPane } from 'reactstrap';

import TaskTable from '../TaskTable/TaskTable';
import EquipmentHistoryTable from '../EquipmentHistoryTable/EquipmentHistoryTable';
import MyNavItem from './MyNavItem';
import { defineMessages, Messages } from 'react-intl';

import { EquipmentModel, TaskModel } from '../../types/Types';

import classnames from 'classnames';

import jsonMessages from "./TaskTabPanes.messages.json";
const taskTabPanesMsg: Messages = defineMessages(jsonMessages);

type Props = {
    classNames: string,
    currentEquipment: EquipmentModel | undefined,
    taskList: TaskModel[],
    areTasksLoading: boolean,
    changeCurrentTask: (task: TaskModel) => void,
    equipmentHistoryRefreshId: number,
    onTaskChangedRef: React.MutableRefObject<(task: TaskModel) => void>
};

const TaskTabPanes = ({ classNames, currentEquipment, taskList, areTasksLoading, changeCurrentTask, equipmentHistoryRefreshId, onTaskChangedRef }: Props) => {
    const [activeTab, setActiveTab] = useState<"taskTable" | "equipmentHistory">("taskTable");
	const [equipmentHistoryClassNames, setEquipmentHistoryClassNames] = useState(classnames({ active: activeTab === 'equipmentHistory' }));
    const [taskTableClassNames, setTaskTableClassNames] = useState(classnames({ active: activeTab === 'taskTable' }));
    
    useEffect(() => {
		setEquipmentHistoryClassNames(classnames({ active: activeTab === 'equipmentHistory' }));
		setTaskTableClassNames(classnames({ active: activeTab === 'taskTable' }));
    }, [activeTab]);
    
    const activeEquipmentHistory = useCallback(() => { setActiveTab('equipmentHistory') }, []);
    const activeTaskTable = useCallback(() => { setActiveTab('taskTable') }, []);
    
    const onTaskChangedByTaskId = (taskId: string) => {
        const task = taskList.find(task => task._uiId === taskId);
        if (task){
            onTaskChangedRef.current(task);
        }
    }
    const onTaskChangedByTaskIdRef = useRef(onTaskChangedByTaskId);
    useEffect(() => {
        onTaskChangedByTaskIdRef.current = onTaskChangedByTaskId;
    }, [taskList, onTaskChangedRef]);

    return <div className={classNames}>
        <Nav tabs>
            <MyNavItem classNames={taskTableClassNames} activeFunc={activeTaskTable} label={taskTabPanesMsg.taskTable} />
            <MyNavItem classNames={equipmentHistoryClassNames} activeFunc={activeEquipmentHistory} label={taskTabPanesMsg.equipementHistory} />
        </Nav>
        <TabContent activeTab={activeTab} className={"flexTabContent"}>
            <TabPane tabId="taskTable" style={{"flex": 1}}>
                {activeTab === "taskTable" && <TaskTable 	equipment={currentEquipment}
                    areTasksLoading={areTasksLoading}
                    tasks={taskList} 
                    onTaskSaved={onTaskChangedRef}
                    changeCurrentTask={changeCurrentTask} />}
            </TabPane>
            <TabPane tabId="equipmentHistory" style={{"flex": 1}}>
                {activeTab === "equipmentHistory" && <EquipmentHistoryTable equipment={currentEquipment}
                        equipmentHistoryRefreshId={equipmentHistoryRefreshId}												
                        onTaskChanged={onTaskChangedByTaskIdRef} />}
            </TabPane>
        </TabContent>
    </div>
} 

export default React.memo(TaskTabPanes);