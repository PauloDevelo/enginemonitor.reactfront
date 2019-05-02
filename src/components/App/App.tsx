import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group'
import {Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { FormattedMessage, defineMessages, Messages } from 'react-intl';

import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import TaskTable from '../TaskTable/TaskTable';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import EquipmentHistoryTable from '../EquipmentHistoryTable/EquipmentHistoryTable';
import MyNavItem from './MyNavItem';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import jsonMessages from "./App.messages.json";
const appMsg: Messages = defineMessages(jsonMessages);

import classnames from 'classnames';

import '../../style/transition.css';
import './App.css'

import { User, Equipment, Task } from '../../types/Types';

export default function App(){
	const [activeTab, setActiveTab] = useState<"taskTable" | "equipmentHistory">("taskTable");
	const [equipmentHistoryClassNames, setEquipmentHistoryClassNames] = useState(classnames({ active: activeTab === 'equipmentHistory' }));
	const [taskTableClassNames, setTaskTableClassNames] = useState(classnames({ active: activeTab === 'taskTable' }));

	useEffect(() => {
		setEquipmentHistoryClassNames(classnames({ active: activeTab === 'equipmentHistory' }));
		setTaskTableClassNames(classnames({ active: activeTab === 'taskTable' }));
	}, [activeTab]);

	const [user, setUser] = useState<User | undefined>(undefined);

	const refreshCurrentUser = async () => {
		try{
			const currentUser = await EquipmentMonitorService.fetchCurrentUser();
			setUser(currentUser);
		}
		catch(error){
			setUser(undefined);
		}
	}

	useEffect(() => {
		refreshCurrentUser();
	}, []);

	const [currentEquipment, setCurrentEquipment] = useState<Equipment | undefined>(undefined);
	const [taskList, setTaskList] = useState<Task[]>([]);
	const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
	const [areTasksLoading, setAreTasksLoading] = useState(false);
	const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);
	const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);

	useEffect(() => {
		refreshTaskList();
	}, [currentEquipment]);

	const onTaskDeleted = useCallback((task: Task)=>{
		refreshTaskList();
		setEquipmentHistoryRefreshId(equipmentHistoryRefreshId + 1);
	}, [equipmentHistoryRefreshId, taskList, currentTask, currentEquipment]);

	const onCurrentTaskChanged = useRef((task: Task)=>{
		refreshTaskList();
	});
	useEffect(() => {
		onCurrentTaskChanged.current = () => refreshTaskList();
	}, [taskList, currentTask, currentEquipment]);


	const changeCurrentTask = useCallback((newCurrentTask: Task | undefined) => {
		setCurrentTask(newCurrentTask);
	}, []);

	const onTaskChanged = (taskId: string) => {
		refreshTaskList();

		const currentTaskId = currentTask ? currentTask._id : undefined;
		if(taskId === currentTaskId){
			setTaskHistoryRefreshId(taskHistoryRefreshId + 1);
		}
	}

	const onTaskHistoryChanged = () => {
		refreshTaskList();
		setEquipmentHistoryRefreshId(equipmentHistoryRefreshId + 1);
	}
	
	const refreshTaskList = async() => {
		if(currentEquipment !== undefined && currentEquipment._id !== undefined){
			try{
				setAreTasksLoading(true);
				const tasks = await EquipmentMonitorService.fetchTasks(currentEquipment._id);
				tasks.sort((taskA, taskB) => {
					if(taskB.level === taskA.level){
						return taskA.nextDueDate.getTime() - taskB.nextDueDate.getTime();
					}
					else{
						return taskB.level - taskA.level;
					}
				});

				let newCurrentTask = undefined;
				const currentTaskId = currentTask !== undefined ? currentTask._id : undefined
				if(currentTaskId){
					newCurrentTask = tasks.find(t => t._id === currentTaskId);
				}

				setTaskList(tasks);
				setCurrentTask(newCurrentTask);
			}
			catch(error){
				setTaskList([]);
				setCurrentTask(undefined);
			}
			setAreTasksLoading(false);
		}
		else{
			setTaskList([]);
			setCurrentTask(undefined);
		}
	}
	
	const [modalSignupVisible, setModalSignupVisible] = useState(false);
	const [navBarVisible, setNavBarVisible] = useState(true);

	const toggleNavBar = useCallback(() => setNavBarVisible(!navBarVisible), [navBarVisible]);
	const toggleModalSignup = useCallback(() => setModalSignupVisible(!modalSignupVisible), [modalSignupVisible]);
	const logOut = useCallback(() => setUser(undefined), []);
	const activeEquipmentHistory = useCallback(() => { setActiveTab('equipmentHistory') }, []);
	const activeTaskTable = useCallback(() => { setActiveTab('taskTable') }, []);
	
	const panelClassNames = "p-2 m-2 border border-secondary rounded shadow";

	return (
		<Fragment>
			<CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
				<Fragment>
					<NavBar user={user} onLoggedOut={logOut} isOpened={navBarVisible} toggle={toggleNavBar} />
					<div className="appBody mb-2">
						<div className="wrapperColumn">
							<EquipmentsInfo
										user={user}
										changeCurrentEquipment={setCurrentEquipment}
										extraClassNames={panelClassNames + ' columnHeader'}/>
							<div className={panelClassNames + ' columnBody'}>
								<Nav tabs>
									<MyNavItem classNames={taskTableClassNames} activeFunc={activeTaskTable} label={appMsg.taskTable} />
									<MyNavItem classNames={equipmentHistoryClassNames} activeFunc={activeEquipmentHistory} label={appMsg.equipementHistory} />
								</Nav>
								<TabContent activeTab={activeTab} className={"flexTabContent"}>
									<TabPane tabId="taskTable" style={{"flex": 1}}>
										<TaskTable 	equipment={currentEquipment}
											areTasksLoading={areTasksLoading}
											tasks={taskList} 
											onTaskSaved={onCurrentTaskChanged}
											changeCurrentTask={changeCurrentTask} />
									</TabPane>
									<TabPane tabId="equipmentHistory" style={{"flex": 1}}>
										<EquipmentHistoryTable equipment={currentEquipment}
												equipmentHistoryRefreshId={equipmentHistoryRefreshId}												
												onTaskChanged={onTaskChanged} />
									</TabPane>
								</TabContent>
							</div>
						</div>
						<div className="wrapperColumn">
							<CardTaskDetails 	equipment={currentEquipment}
												tasks={taskList}
												currentTask={currentTask}
												onTaskChanged={onCurrentTaskChanged}
												onTaskDeleted={onTaskDeleted}
												changeCurrentTask={changeCurrentTask}
												classNames={panelClassNames + ' columnHeader'}/>
							<HistoryTaskTable 	equipment={currentEquipment}
												task={currentTask}
												onHistoryChanged={onTaskHistoryChanged}
												taskHistoryRefreshId={taskHistoryRefreshId}
												classNames={panelClassNames + ' columnBody lastBlock'}/>
						</div>
					</div>		
				</Fragment>																																																			
			</CSSTransition>
			<ModalLogin visible={!user} 
				onLoggedIn={setUser} 
				className='modal-dialog-centered'
				toggleModalSignup={toggleModalSignup}/>
			
			<ModalSignup visible={modalSignupVisible} 
				toggle={toggleModalSignup} 
				className='modal-dialog-centered'/>
		</Fragment>
	);
}