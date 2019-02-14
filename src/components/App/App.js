import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group'
  
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';
import TaskTable from '../TaskTable/TaskTable';
import ModalEditTask from '../ModalEditTask/ModalEditTask';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';
import { createDefaultTask, getCurrentTask } from '../../helpers/TaskHelper'
import { createDefaultEquipment, getCurrentEquipment } from '../../helpers/EquipmentHelper'
import { createDefaultEntry } from '../../helpers/EntryHelper'

import '../../style/transition.css';
import appmsg from "./App.messages";

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			user: {},

			modalEquipmentInfo: false,
			modalEditTask: false,
			modalEditEntry: false,
			modalYesNo: false,
			modalSignup: false,
			navBar: true,

			yes: (() => {}),
			no: (() => {}),

			yesNoTitle: appmsg.defaultTitle,
			yesNoMsg: appmsg.defaultMsg,

			equipments: [],
			currentEquipmentIndex: -1,
			editedEquipment: undefined,
			tasks:[],
			currentTaskIndex: -1,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', date: new Date(), age: '', remarks: '' }
		};
	}

	setStateAsync = updater => new Promise(resolve => this.setState(updater, resolve))

	login = async (credentials) => {
		const user = await EquipmentMonitorService.authenticate(credentials);
		await this.setStateAsync((prevState, props) => { return { user: user } });
		await this.refreshEquipmentList();
	}

	logout = async () => {
		EquipmentMonitorService.logout();
		await this.setStateAsync( (prevState, props) => { return { user: undefined } });
		await this.refreshEquipmentList();
		this.refreshTaskList();
	}

	toggleNavBar = () => this.setState((prevState, props) => {return { navBar: !prevState.navBar }});

	toggleModalYesNoConfirmation = () => this.setState((prevState, props) => {return { modalYesNo: !prevState.modalYesNo }});

	toggleModalSignup = () => this.setState((prevState, props) => {return { modalSignup: !prevState.modalSignup }});

	toggleModalEditEntry = (isCreationMode, entry) => {
    	this.setState((prevState, props) => { 
			var newState = { 
				modalEditEntry: !prevState.modalEditEntry
			 }; 

			 if(isCreationMode !== undefined){
				newState.editedEntry = isCreationMode?createDefaultEntry(prevState):entry
			 }

			 return newState
		});
  	}
	
	toggleModalEquipmentInfo = (isCreationMode) => {
		this.setState((prevState, props) => {
			let newState = { modalEquipmentInfo: !prevState.modalEquipmentInfo };

			if(isCreationMode !== undefined){
				newState.editedEquipment = isCreationMode?createDefaultEquipment(prevState):prevState.equipments[prevState.currentEquipmentIndex];
			}

			return newState;
		});
	}
	
	toggleModalEditTask = (isCreationMode) => {
		this.setState( (prevState, props) => {
			return { 
				modalEditTask: !prevState.modalEditTask,
				editedTask: isCreationMode ? createDefaultTask() : getCurrentTask(prevState)
			}
		});
	}
	
	refreshCurrentUser = async () => {
		try{
			const user = await EquipmentMonitorService.refreshCurrentUser();
			this.setState({ user:user });
		}
		catch(error){
			this.setState({ user: undefined })
		}
	}

	changeCurrentEquipment = async (newEquipmentIndex) => {
		await this.setStateAsync({ currentEquipmentIndex:newEquipmentIndex });
		await this.refreshTaskList();

		if(this.state.tasks.length > 0){
			this.changeCurrentTaskIndex(0);
		}
	}

	createOrSaveEquipmentInfo = async (equipmentInfo) => {
		const equipment = await EquipmentMonitorService.createOrSaveEquipment(equipmentInfo);

		if(equipmentInfo._id){
			await this.setStateAsync((prevState, props) => {
				prevState.equipments[prevState.currentEquipmentIndex] = equipment;
				return { equipments: prevState.equipments }; 
			});
		}
		else{
			await this.setStateAsync((prevState, props) => {
				prevState.equipments.push(equipment);
				return { equipments: prevState.equipments };
			});
		}
		
		await this.changeCurrentEquipment(this.state.currentEquipmentIndex);
	}

	refreshEquipmentList = async () => {
		try{
			const equipments = await EquipmentMonitorService.getEquipments();
			await this.setStateAsync({ equipments:equipments });

			if(this.state.currentEquipmentIndex === -1 && this.state.equipments.length > 0)
				await this.changeCurrentEquipment(0);
			else if (this.state.currentEquipmentIndex >= this.state.equipments.length){
				await this.changeCurrentEquipment(-1);
			}
		}
		catch(error){
			this.setState({ equipments:[], currentEquipmentIndex:-1 });
		}
	}
	
	createOrSaveTask = async (taskToSave) => {
		if(this.state.currentEquipmentIndex === -1){
			throw Error("noEquipmentSelected");
		}

		const currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		const savedTask = await EquipmentMonitorService.createOrSaveTask(currentEquipment._id, taskToSave);
		await this.refreshTaskList();
		this.changeCurrentTask(savedTask);
	}

	deleteTask = (onYes, onNo, onError) => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1) ? this.state.currentTaskIndex - 1:this.state.currentTaskIndex
		
		this.setState((prevState, props) => {
			let currentEquipment = prevState.equipments[prevState.currentEquipmentIndex];

			return {
				modalYesNo: true,
				yes: async() => {
					try{
						this.toggleModalYesNoConfirmation();
						await EquipmentMonitorService.deleteTask(currentEquipment._id, prevState.editedTask._id);
						await this.refreshTaskList();
						await this.changeCurrentTaskIndex(nextTaskIndex);
						onYes();
					}
					catch(error){
						if(onError) onError();
					}
				},
				no: () => {
					this.toggleModalYesNoConfirmation();
					if(onNo) onNo();
				},
				yesNoTitle: appmsg.taskDeleteTitle,
				yesNoMsg: appmsg.taskDeleteMsg,
			};
		});
	}
	
	nextTask = async() => {
		if(this.state.currentTaskIndex + 1 < this.state.tasks.length){
			await this.changeCurrentTaskIndex(this.state.currentTaskIndex + 1);
		}
	}

	previousTask = async() => {
		if(this.state.currentTaskIndex - 1 >= 0){
			await this.changeCurrentTaskIndex(this.state.currentTaskIndex - 1);
		}
	}

	changeCurrentTask = async (task) => {
		if(task !== getCurrentTask(this.state)){
			var newCurrentTaskIndex = this.state.tasks.findIndex(t => t._id === task._id);
			await this.changeCurrentTaskIndex(newCurrentTaskIndex);
		}
	}

	changeCurrentTaskIndex = async (newTaskIndex) => {
		if(newTaskIndex < -1 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		if (newTaskIndex === -1){
			await this.setStateAsync({ currentHistoryTask: [], currentTaskIndex: -1 });
			return;
		}

		let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask._id;

		try{
			const entries = await EquipmentMonitorService.refreshHistoryTask(currentEquipment._id, newCurrentTaskId);
			await this.setStateAsync({ currentHistoryTask: entries, currentTaskIndex: newTaskIndex });
		}
		catch(error){
			await this.setStateAsync({ currentHistoryTask: [], currentTaskIndex: newTaskIndex });
			throw error;
		}
	}
	
	refreshTaskList = async() => {
		if(this.state.currentEquipmentIndex !== -1){
			let currentEquipment = getCurrentEquipment(this.state);
			try{
				const tasks = await EquipmentMonitorService.refreshTaskList(currentEquipment._id);

				// store the new state object in the component's state
				await this.setStateAsync((prevState, props) => {
					let newCurrentTaskIndex = -1;
					if(prevState.currentTaskIndex !== -1){
						newCurrentTaskIndex = tasks.findIndex(task => task._id === getCurrentTask(prevState)._id);
					}
					else if(tasks.length > 0){
						newCurrentTaskIndex = 0;
					}

					return {
						tasks: tasks,
						currentTaskIndex: newCurrentTaskIndex
					}
				});
			}
			catch(error){
				await this.emptyTaskList();
			}
		}
		else{
			await this.emptyTaskList();
		}
	}

	emptyTaskList = async () => {
		await this.setStateAsync({ tasks: [], currentTaskIndex: -1, currentHistoryTask: [] });
	}		

	createOrSaveEntry = async (entryToSave) => {
		let currentEquipment = getCurrentEquipment(this.state);
		let savedEntry = await EquipmentMonitorService.createOrSaveEntry(currentEquipment._id, getCurrentTask(this.state)._id, entryToSave);
		
		await this.setStateAsync((prevState, props) => {
			var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry._id !== savedEntry._id);
			newCurrentHistoryTask.unshift(savedEntry);
			newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.date - entryb.date; });

			return { currentHistoryTask: newCurrentHistoryTask };
		});

		this.refreshTaskList();
	}
	
	deleteEntry = (entryId, onYes, onNo, onError) => {
		this.setState((prevState, props) => {
			let currentEquipment = getCurrentEquipment(prevState);

			return {
				modalYesNo: true,
				yes: (async () => {
					this.toggleModalYesNoConfirmation();
					try{
						await EquipmentMonitorService.deleteEntry(currentEquipment._id, getCurrentTask(this.state)._id, entryId);
						this.refreshTaskList();
						this.setState((prevState, props) => {
								return({ currentHistoryTask: prevState.currentHistoryTask.slice(0).filter(e => e._id !== entryId) });
							},
							() => {
								if(onYes && typeof onYes === 'function') onYes();
							}
						);
					}
					catch(error){
						if(onError) onError();
					}
				}),
				no: (() => {
					this.toggleModalYesNoConfirmation();
					if(onNo) onNo();
				}),
				yesNoTitle: appmsg.entryDeleteTitle,
				yesNoMsg: appmsg.entryDeleteMsg,
			};
		});
	}

	async componentDidMount() {
		await this.refreshCurrentUser();
		await this.refreshEquipmentList();

		if(this.state.equipments.length > 0){
			this.changeCurrentEquipment(0);
		}
	}
    
	render() {
		var panelClassNames = "p-2 m-2 border border-secondary rounded shadow";
		var prevVisibility = this.state.currentTaskIndex > 0;
		var nextVisibility = this.state.currentTaskIndex < this.state.tasks.length - 1;
		return (
			<CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
				<div id="root">
					<NavBar user={this.state.user} logout={this.logout} isOpened={this.state.navBar} toggle={this.toggleNavBar} />
					<div className="d-flex flex-wrap flex-row mb-3">
						<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
							<EquipmentsInfo equipments={this.state.equipments}
										currentEquipmentIndex={this.state.currentEquipmentIndex}
										changeCurrentEquipment={this.changeCurrentEquipment}
										toggleModal={this.toggleModalEquipmentInfo}
										extraClassNames={panelClassNames}/>
							<TaskTable 	tasks={this.state.tasks} 
										toggleModal={() => this.toggleModalEditTask(true)} 
										changeCurrentTask={this.changeCurrentTask}
										classNames={panelClassNames}/>
						</div>
						<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
							<CardTaskDetails 	task={this.state.tasks[this.state.currentTaskIndex]} 
												toggleModal={() => this.toggleModalEditTask(false)} 
												next={this.nextTask} 
												prev={this.previousTask} 
												prevVisibility={prevVisibility} 
												nextVisibility={nextVisibility} 
												toggleAckModal={()=>this.toggleModalEditEntry(true)}
												classNames={panelClassNames}/>
							<HistoryTaskTable 	taskHistory={this.state.currentHistoryTask} 
												toggleEntryModal={this.toggleModalEditEntry}
												classNames={panelClassNames}/>
						</div>
					</div>
					
					<ModalEquipmentInfo visible={this.state.modalEquipmentInfo} 
						toggle={this.toggleModalEquipmentInfo} 
						saveEquipmentInfo={this.createOrSaveEquipmentInfo} 
						data={this.state.editedEquipment}
						className='modal-dialog-centered'
					/>
					<ModalEditTask visible={this.state.modalEditTask} 
						toggle={this.toggleModalEditTask} 
						saveTask={this.createOrSaveTask} 
						deleteTask={this.deleteTask}
						task={this.state.editedTask}
						className='modal-dialog-centered'
					/>
					<ModalEditEntry visible={this.state.modalEditEntry}
						toggle={this.toggleModalEditEntry} 
						saveEntry={this.createOrSaveEntry} 
						deleteEntry={this.deleteEntry}
						entry={this.state.editedEntry}
						className='modal-dialog-centered'
					/>
					<ModalYesNoConfirmation visible={this.state.modalYesNo}
						toggle={this.toggleModalYesNoConfirmation}
						yes={this.state.yes}
						no={this.state.no}
						title={this.state.yesNoTitle}
						message={this.state.yesNoMsg} 
						className='modal-dialog-centered'
					/>
					<ModalLogin visible={this.state.user === undefined && EquipmentMonitorService.mode === 'auth'} 
						login={this.login}
						data={{ email: '', password: ''}} 
						className='modal-dialog-centered'
						toggleModalSignup={this.toggleModalSignup}/>
					<ModalSignup visible={this.state.modalSignup && EquipmentMonitorService.mode === 'auth'} 
						toggle={this.toggleModalSignup} 
						className='modal-dialog-centered'/>																																																					
				</div>
			</CSSTransition>
		);
	}
}

export default App;