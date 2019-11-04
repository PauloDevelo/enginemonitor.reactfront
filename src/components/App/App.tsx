import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';

import {scrollTo} from '../../helpers/Helpers';

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


import {useAsync} from 'react-async';
import httpProxy from '../../services/HttpProxy';
import { CancelTokenSource } from 'axios';

export default function App(){
	const [user, setUser] = useState<UserModel | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);

	

	useEffect(() => {
		const refreshCurrentUser = async () => {
			try{
				const currentUser = await userProxy.fetchCurrentUser();
				setUser(currentUser);
			}
			catch(error){
				setUser(undefined);
			}
		}

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

	const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);
	const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);

	const cancelTokenSourceRef = useRef<CancelTokenSource | undefined>(undefined);
	const fetchTasks = useCallback(async() => {
		if(currentEquipment === undefined || currentEquipment._uiId === undefined){
			return [];
		}

		cancelTokenSourceRef.current = httpProxy.createCancelTokenSource();
		const tasks = await taskProxy.fetchTasks({ equipmentId: currentEquipment._uiId, cancelToken: cancelTokenSourceRef.current.token});
		tasks.sort((taskA, taskB) => {
			if(taskB.level === taskA.level){
				return taskA.nextDueDate.getTime() - taskB.nextDueDate.getTime();
			}
			else{
				return taskB.level - taskA.level;
			}
		});

		return tasks;
	
	}, [currentEquipment]);

	const {data: fetchedTasks, isLoading, reload} = useAsync({ promiseFn: fetchTasks, onCancel: () => {
        if (cancelTokenSourceRef.current){
            cancelTokenSourceRef.current.cancel("Cancellation of the task fetch.");
        }
    }});

    const reloadTasksRef = useRef(reload);
    useEffect(() => {
        reloadTasksRef.current = reload;
	}, [reload]);
	
	useEffect(() => {
		setTaskList(fetchedTasks?fetchedTasks:[]);
	}, [fetchedTasks]);

	const setCurrentTaskIfRequired = useCallback(() => {
		setCurrentTask(previousCurrentTask => {
			if(taskList.length === 0){
				return undefined;
			}
			let newCurrentTask = undefined;
			const previousCurrentTaskId = previousCurrentTask !== undefined ? previousCurrentTask._uiId : undefined;
			if(previousCurrentTaskId){
				newCurrentTask = taskList.find(t => t._uiId === previousCurrentTaskId);
			}

			if(newCurrentTask === undefined){
				newCurrentTask = taskList[0];
			}
			return newCurrentTask;
		});
	}, [taskList]);

	useEffect(() => {
		setCurrentTaskIfRequired();
	}, [setCurrentTaskIfRequired]);

	const cardTaskDetailDomRef = useRef(null);
	const cardTaskDetailDomCallBack = useCallback(node => cardTaskDetailDomRef.current = node, []);
	const onClickTaskTable = useCallback((task: TaskModel) => {
		setCurrentTask(task);

		if(cardTaskDetailDomRef.current != null){
            scrollTo((cardTaskDetailDomRef!.current! as any).offsetLeft, (cardTaskDetailDomRef!.current! as any).offsetTop, 250);
        }
	}, []);

	const onTaskDeleted = useCallback((task: TaskModel)=>{
		reloadTasksRef.current();
		setEquipmentHistoryRefreshId(previousEquipmentHistoryRefreshId => previousEquipmentHistoryRefreshId + 1);
	}, []);

	const onTaskChanged = useCallback((task: TaskModel)=>{
		reloadTasksRef.current();

		const currentTaskId = currentTask ? currentTask._uiId : undefined;
		if(task._uiId === currentTaskId){
			setTaskHistoryRefreshId(previousTaskHistoryRefreshId => previousTaskHistoryRefreshId + 1);
		}
		else{
			setCurrentTask(task);
		}
	}, [currentTask]);

	const onTaskHistoryChanged = useCallback(() => {
		reloadTasksRef.current();
		setEquipmentHistoryRefreshId(previousEquipmentHistoryRefreshId => previousEquipmentHistoryRefreshId + 1);
	}, []);

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
								<NavBar onLoggedOut={logOut} isOpened={navBarVisible} toggle={toggleNavBar} />
								<div className="appBody mb-2">
									<div className="wrapperColumn">
										<EquipmentsInfo
													userId={user?user._uiId:undefined}
													changeCurrentEquipment={setCurrentEquipment}
													extraClassNames={panelClassNames + ' columnHeader'}/>
										<TaskTabPanes classNames={panelClassNames + ' columnBody'}
														currentEquipment={currentEquipment}
														taskList= {taskList}
														areTasksLoading={isLoading}
														changeCurrentTask={onClickTaskTable}
														equipmentHistoryRefreshId={equipmentHistoryRefreshId}
														onTaskChanged={onTaskChanged} />
									</div>
									<div className="wrapperColumn">
										<CardTaskDetails 	callBackRef={cardTaskDetailDomCallBack}
															equipment={currentEquipment}
															tasks={taskList}
															currentTask={currentTask}
															onTaskChanged={onTaskChanged}
															onTaskDeleted={onTaskDeleted}
															changeCurrentTask={setCurrentTask}
															classNames={panelClassNames + ' columnHeader'}/>
										<HistoryTaskTable 	equipment={currentEquipment}
															task={currentTask}
															onHistoryChanged={onTaskHistoryChanged}
															taskHistoryRefreshId={taskHistoryRefreshId}
															classNames={panelClassNames + ' columnBody lastBlock'}/>
									</div>
								</div>
								<SyncAlert className="bottomright"/>
								<ErrorAlert error={error} onDismiss={dismissError} className="bottomright"/>
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