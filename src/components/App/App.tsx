import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';

import { CSSTransition } from 'react-transition-group'

import TaskTabPanes from '../TaskTabPanes/TaskTabPanes';
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import SyncAlert from '../SyncAlert/SyncAlert';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import CacheBuster from '../CacheBuster/CacheBuster';

import userProxy from '../../services/UserProxy';
import taskProxy from '../../services/TaskProxy';
import errorService from '../../services/ErrorService'

import '../../style/transition.css';
import './App.css'

import { UserModel, EquipmentModel, TaskModel } from '../../types/Types';

export default function App(){
	const [user, setUser] = useState<UserModel | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);

	const refreshCurrentUser = async () => {
		try{
			const currentUser = await userProxy.fetchCurrentUser();
			setUser(currentUser);
		}
		catch(error){
			setUser(undefined);
		}
	}

	useEffect(() => {
		refreshCurrentUser();
		errorService.registerOnListErrorChanged(onListErrorChanged);

		return function() {
			errorService.unregisterOnListErrorChanged(onListErrorChanged);
		};
	}, []);

	const onListErrorChanged = (errors: Error[]) => {
		if(errors.length > 0){
			setError(errors[errors.length - 1]);
		}
		else{
			setError(undefined);
		}
	}

	const dismissError = useCallback(() => {
		if(error !== undefined){
			errorService.removeError(error);
		}
	}, [error]);

	const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(undefined);
	const [taskList, setTaskList] = useState<TaskModel[]>([]);
	const [currentTask, setCurrentTask] = useState<TaskModel | undefined>(undefined);
	const [areTasksLoading, setAreTasksLoading] = useState(false);
	const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);
	const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);

	useEffect(() => {
		refreshTaskList();
	}, [currentEquipment]);

	useEffect(() => {
		setCurrentTaskIfRequired();
	}, [taskList]);

	const onTaskDeleted = useCallback((task: TaskModel)=>{
		refreshTaskList();
		setEquipmentHistoryRefreshId(equipmentHistoryRefreshId + 1);
	}, [equipmentHistoryRefreshId, taskList, currentTask, currentEquipment]);

	const onTaskChanged = (task: TaskModel)=>{
		refreshTaskList();

		const currentTaskId = currentTask ? currentTask._uiId : undefined;
		if(task._uiId === currentTaskId){
			setTaskHistoryRefreshId(taskHistoryRefreshId + 1);
		}
		else{
			changeCurrentTask(task);
		}
	};
	const onTaskChangedRef = useRef(onTaskChanged);
	useEffect(() => {
		onTaskChangedRef.current = onTaskChanged;
	}, [currentEquipment, currentTask, taskHistoryRefreshId]);

	const changeCurrentTask = useCallback((newCurrentTask: TaskModel | undefined) => {
		setCurrentTask(newCurrentTask);
	}, []);

	const onTaskHistoryChanged = useCallback(() => {
		refreshTaskList();
		setEquipmentHistoryRefreshId(equipmentHistoryRefreshId + 1);
	}, [equipmentHistoryRefreshId, currentEquipment]);
	
	const refreshTaskList = async() => {
		if(currentEquipment !== undefined && currentEquipment._uiId !== undefined){
			try{
				setAreTasksLoading(true);
				const tasks = await taskProxy.fetchTasks(currentEquipment._uiId);
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
			const currentTaskId = currentTask !== undefined ? currentTask._uiId : undefined
			if(currentTaskId){
				newCurrentTask = taskList.find(t => t._uiId === currentTaskId);
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
		<CacheBuster>
			{({ loading, isLatestVersion, refreshCacheAndReload }:any) => {
				if (loading) return null;
				if (!loading && !isLatestVersion) {
					// You can decide how and when you want to force reload
					refreshCacheAndReload();
				}

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
								<SyncAlert className="bottomright"/>
								<ErrorAlert hasError={error !== undefined} error={error} onDismiss={dismissError} className="bottomright"/>
							</Fragment>																																																			
						</CSSTransition>
						{!user && <ModalLogin visible={!user} 
							onLoggedIn={setUser} 
							className='modal-dialog-centered'
							toggleModalSignup={toggleModalSignup}/>}
						
						{modalSignupVisible && <ModalSignup visible={modalSignupVisible} 
							toggle={toggleModalSignup} 
							className='modal-dialog-centered'/>}
					</Fragment>
				);
			}}
		</CacheBuster>
	);
}