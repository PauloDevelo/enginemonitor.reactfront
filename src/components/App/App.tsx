import React, { Fragment, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group'
  
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import TaskTable from '../TaskTable/TaskTable';
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
	const [task, setTask] = useState<{ list: Task[], current: Task | undefined }>({ list:[], current: undefined });
	const [areTasksLoading, setAreTasksLoading] = useState(false);

	useEffect(() => {
		refreshTaskList();
	}, [currentEquipment]);

	const onCurrentTaskChanged = (task: Task)=>{
		refreshTaskList();
	}

	const changeCurrentTask = (newCurrentTask: Task | undefined) => {
		if (newCurrentTask !== task.current){
			setTask({ list: task.list, current: newCurrentTask });
		}
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
				const currentTaskId = task.current !== undefined ? task.current._id : undefined
				if(currentTaskId){
					newCurrentTask = tasks.find(t => t._id === currentTaskId);
				}

				setTask({ list: tasks, current: newCurrentTask });
			}
			catch(error){
				setTask({ list: [], current: undefined });
			}
			setAreTasksLoading(false);
		}
		else{
			setTask({ list: [], current: undefined });
		}
	}
	
	const [modalSignupVisible, setModalSignupVisible] = useState(false);
	const [navBarVisible, setNavBarVisible] = useState(true);

	const toggleNavBar = () => setNavBarVisible(!navBarVisible);
	const toggleModalSignup = () => setModalSignupVisible(!modalSignupVisible);

	var panelClassNames = "p-2 m-2 border border-secondary rounded shadow";
	return (
		<Fragment>
			<CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
				<Fragment>
					<NavBar user={user} onLoggedOut={() => setUser(undefined)} isOpened={navBarVisible} toggle={toggleNavBar} />
					<div className="appBody mb-2">
						<div className="wrapperColumn">
							<EquipmentsInfo
										user={user}
										changeCurrentEquipment={setCurrentEquipment}
										extraClassNames={panelClassNames + ' columnHeader'}/>
							<TaskTable 	equipment={currentEquipment}
										areTasksLoading={areTasksLoading}
										tasks={task.list} 
										onTaskSaved={onCurrentTaskChanged}
										changeCurrentTask={changeCurrentTask}
										classNames={panelClassNames + ' columnBody'}/>
						</div>
						<div className="wrapperColumn">
							<CardTaskDetails 	equipment={currentEquipment}
												tasks={task.list}
												currentTask={task.current}
												onTaskChanged={onCurrentTaskChanged}
												onTaskDeleted={onCurrentTaskChanged}
												changeCurrentTask={changeCurrentTask}
												classNames={panelClassNames + ' columnHeader'}/>
							<HistoryTaskTable 	equipment={currentEquipment}
												task={task.current}
												onHistoryChanged={refreshTaskList}
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