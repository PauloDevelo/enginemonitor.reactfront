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

export default function App(){
	const [user, setUser] = useState(undefined);

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

	const [currentEquipment, setCurrentEquipment] = useState(undefined);
	const [task, setTask] = useState({ list:[], current: undefined });

	useEffect(() => {
		refreshTaskList();
	}, [currentEquipment]);

	const onCurrentTaskChanged = (task)=>{
		refreshTaskList();
	}

	const changeCurrentTask = (newCurrentTask) => {
		if (newCurrentTask !== task.current){
			setTask({ list: task.list, current: newCurrentTask });
		}
	}
	
	const refreshTaskList = async() => {
		if(currentEquipment !== undefined){
			try{
				const tasks = await EquipmentMonitorService.fetchTasks(currentEquipment._id);
				let newCurrentTask = undefined;
				if(task.current !== undefined){
					newCurrentTask = tasks.find(t => t._id === task.current._id);
				}

				// store the new state object in the component's state
				setTask({ list: tasks, current: newCurrentTask });
			}
			catch(error){
				setTask({ list: [], current: undefined });
			}
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
				<div id="root">
					<NavBar user={user} onLoggedOut={() => setUser(undefined)} isOpened={navBarVisible} toggle={toggleNavBar} />
					<div className="d-flex flex-wrap flex-row mb-3">
						<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
							<EquipmentsInfo
										user={user}
										changeCurrentEquipment={setCurrentEquipment}
										extraClassNames={panelClassNames}/>
							<TaskTable 	equipment={currentEquipment}
										tasks={task.list} 
										onTaskSaved={onCurrentTaskChanged}
										changeCurrentTask={changeCurrentTask}
										classNames={panelClassNames}/>
						</div>
						<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
							<CardTaskDetails 	equipment={currentEquipment}
												tasks={task.list}
												currentTask={task.current}
												onTaskChanged={onCurrentTaskChanged}
												onTaskDeleted={onCurrentTaskChanged}
												changeCurrentTask={changeCurrentTask}
												classNames={panelClassNames}/>
							<HistoryTaskTable 	equipment={currentEquipment}
												task={task.current}
												onHistoryChanged={refreshTaskList}
												classNames={panelClassNames}/>
						</div>
					</div>																																																					
				</div>
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