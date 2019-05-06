import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group'

import TaskTabPanes from '../TaskTabPanes/TaskTabPanes';
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import '../../style/transition.css';
import './App.css'

import { User, Equipment, Task } from '../../types/Types';

export default function App(){
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

	useEffect(() => {
		setCurrentTaskIfRequired();
	}, [taskList]);

	const onTaskDeleted = useCallback((task: Task)=>{
		refreshTaskList();
		setEquipmentHistoryRefreshId(equipmentHistoryRefreshId + 1);
	}, [equipmentHistoryRefreshId, taskList, currentTask, currentEquipment]);

	const onTaskChanged = (task: Task)=>{
		refreshTaskList();

		const currentTaskId = currentTask ? currentTask._id : undefined;
		if(task._id === currentTaskId){
			setTaskHistoryRefreshId(taskHistoryRefreshId + 1);
		}
	};
	const onTaskChangedRef = useRef(onTaskChanged);
	useEffect(() => {
		onTaskChangedRef.current = onTaskChanged;
	}, [currentEquipment, currentTask, taskHistoryRefreshId]);

	const changeCurrentTask = useCallback((newCurrentTask: Task | undefined) => {
		setCurrentTask(newCurrentTask);
	}, []);

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

				setTaskList(tasks);
			}
			catch(error){
				setTaskList([]);
			}
			setAreTasksLoading(false);
		}
		else{
			setTaskList([]);
		}
	}

	const setCurrentTaskIfRequired = () => {
		if(taskList.length === 0){
			setCurrentTask(undefined);
		}
		else{
			let newCurrentTask = undefined;
			const currentTaskId = currentTask !== undefined ? currentTask._id : undefined
			if(currentTaskId){
				newCurrentTask = taskList.find(t => t._id === currentTaskId);
			}

			if(newCurrentTask === undefined){
				newCurrentTask = taskList[0];
			}

			setCurrentTask(newCurrentTask);
		}
	}
	
	const [modalSignupVisible, setModalSignupVisible] = useState(false);
	const [navBarVisible, setNavBarVisible] = useState(true);

	const toggleNavBar = useCallback(() => setNavBarVisible(!navBarVisible), [navBarVisible]);
	const toggleModalSignup = useCallback(() => setModalSignupVisible(!modalSignupVisible), [modalSignupVisible]);
	const logOut = useCallback(() => setUser(undefined), []);
	
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
							<TaskTabPanes classNames={panelClassNames + ' columnBody'}
    										currentEquipment={currentEquipment}
    										taskList= {taskList}
											areTasksLoading={areTasksLoading}
											changeCurrentTask={changeCurrentTask}
											equipmentHistoryRefreshId={equipmentHistoryRefreshId}
											onTaskChangedRef={onTaskChangedRef} />
						</div>
						<div className="wrapperColumn">
							<CardTaskDetails 	equipment={currentEquipment}
												tasks={taskList}
												currentTask={currentTask}
												onTaskChanged={onTaskChangedRef}
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