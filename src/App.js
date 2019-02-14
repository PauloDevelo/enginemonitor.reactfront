import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group'
  
import EquipmentsInfo from './EquipmentsInfo';
import ModalEquipmentInfo from './ModalEquipmentInfo';
import TaskTable from './TaskTable';
import ModalEditTask from './ModalEditTask';
import HistoryTaskTable from './HistoryTaskTable'
import CardTaskDetails from './CardTaskDetails'
import ModalYesNoConfirmation from './ModalYesNoConfirmation'
import ModalEditEntry from './ModalEditEntry';
import ModalLogin from './ModalLogin';
import ModalSignup from './ModalSignup';
import NavBar from './NavBar';
import EquipmentMonitorService from './EquipmentMonitorServiceProxy';
import HttpError from './HttpError'

import './transition.css';
import appmsg from "./App.messages";

function createDefaultEquipment(state){
	return {
		name: "",
		brand: "",
		model: "",
		age: "",
		installation: new Date()
	}
}

function createDefaultEntry(state){
	return {
		name: state.currentTask.name,
		date: new Date(),
		age: state.equipments[state.currentEquipmentIndex].age,
		remarks: '',
	}
}

function createDefaultTask(state){
	return {
		name: '',
		usagePeriodInHour: 100,
		periodInMonth: 12,
		description: ''
	}
}

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			pos: undefined,
			user: {},
			loginErrors: undefined,

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
			currentTask: undefined,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', date: new Date(), age: '', remarks: '' }
		};
	}

	setStateAsync = updater => new Promise(resolve => this.setState(updater, resolve))

	login = async (credentials) => {
		try{
			const user = await EquipmentMonitorService.authenticate(credentials);
			await this.setStateAsync((prevState, props) => { return { user: user, loginErrors: undefined } });
			await this.refreshEquipmentList();
		}
		catch(errors){
			if(errors instanceof HttpError){
				this.setState((prevState, props) => { return { loginErrors: errors.data } });
			}
		}
	}

	logout = async () => {
		EquipmentMonitorService.logout();
		await this.setStateAsync( (prevState, props) => { return { user: undefined, loginErrors: undefined } });
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
				newState.editedEntry= isCreationMode?createDefaultEntry(prevState):entry
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
				editedTask: isCreationMode ? createDefaultTask(prevState) : prevState.currentTask
			}
		});
	}
	
	refreshCurrentUser = async () => {
		try{
			const {user} = await EquipmentMonitorService.refreshCurrentUser();
			this.setState({ user:user });
		}
		catch(error){
			this.setState({ user: undefined })
		}
	}

	refreshPosition = () => {
		// Try HTML5 geolocation.
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
			  var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			  };
			  this.setState( (prevState, props) => { return { pos: pos } });

			});
		}
	}
	
	changeCurrentEquipment = async (newEquipmentIndex) => {
		await this.setStateAsync((prevState, props) => { return { currentEquipmentIndex:newEquipmentIndex };});
		await this.refreshTaskList();

		if(this.state.tasks.length > 0){
			this.changeCurrentTaskIndex(0);
		}
	}

	saveEquipmentInfo = async (equipmentInfo) => {
		const {equipment} = await EquipmentMonitorService.saveEquipment(equipmentInfo);
		equipment.installation = new Date(equipment.installation);

		if(equipmentInfo._id){
			this.setState((prevState, props) => {
				prevState.equipments[prevState.currentEquipmentIndex] = equipment;
				return { equipments: prevState.equipments }; 
			});
		}
		else{
			this.setState((prevState, props) => {
				prevState.equipments.push(equipment);
				return { equipments: prevState.equipments };
			});
		}
	}

	refreshEquipmentList = async () => {
		try{
			const {equipments} = await EquipmentMonitorService.getEquipments();
			equipments.forEach((equipment) => { equipment.installation = new Date(equipment.installation); });
			
			await this.setStateAsync((prevState, props) => { return { equipments:equipments } });

			if(this.state.currentEquipmentIndex === -1 && this.state.equipments.length > 0)
				await this.changeCurrentEquipment(0);
			else if (this.state.currentEquipmentIndex >= this.state.equipments.length){
				await this.changeCurrentEquipment(-1);
			}
		}
		catch(error){
			this.setState((prevState, props) => {
				return { equipments:[], currentEquipmentIndex:-1 }
			});
		}
	}
	
	createOrSaveTask = async (taskToSave) => {
		if(this.state.currentEquipmentIndex === -1){
			throw Error("noEquipmentSelected");
		}

		const currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		let saveTask;
		if(!taskToSave._id){
			const {task} = await EquipmentMonitorService.createTask(currentEquipment._id, taskToSave);
			saveTask = task;
			
		}
		else{
			const {task} = await EquipmentMonitorService.saveTask(currentEquipment._id, taskToSave);
			saveTask = task;
		}

		await this.refreshTaskList();
		this.changeCurrentTask(saveTask);
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
		if(task !== this.state.currentTask){
			var newCurrentTaskIndex = this.state.tasks.findIndex((t, ind, tab) => t._id === task._id);
			await this.changeCurrentTaskIndex(newCurrentTaskIndex);
		}
	}

	changeCurrentTaskIndex = async (newTaskIndex) => {
		if(newTaskIndex < -1 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		if (newTaskIndex === -1){
			await this.setStateAsync((prevState, props) => { 
				return {
					currentHistoryTask: [],
					currentTaskIndex: -1,
					currentTask: undefined
				}; 
			});
			return;
		}

		let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask._id;

		try{
			const {entries} = await EquipmentMonitorService.refreshHistoryTask(currentEquipment._id, newCurrentTaskId);
			entries.forEach(entry => { entry.date = new Date(entry.date) });

			await this.setStateAsync((prevState, props) => { 
				return {
					currentHistoryTask: entries,
					currentTaskIndex: newTaskIndex,
					currentTask: newCurrentTask
				}; 
			});
		}
		catch(error){
			await this.setStateAsync((prevState, props) => { 
				return {
					currentHistoryTask: [],
					currentTaskIndex: newTaskIndex,
					currentTask: newCurrentTask
				}; 
			});
			throw error;
		}
	}
	
	refreshTaskList = async() => {
		if(this.state.currentEquipmentIndex !== -1){
			let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
			try{
				const { tasks } = await EquipmentMonitorService.refreshTaskList(currentEquipment._id);
				tasks.forEach(task => task.usagePeriodInHour = task.usagePeriodInHour === -1 ? undefined : task.usagePeriodInHour);
				
				// store the new state object in the component's state
				await this.setStateAsync((prevState, props) => {
					var newCurrentTaskIndex = prevState.currentTask ? tasks.findIndex(task => task._id === prevState.currentTask._id) : 0;
					return {
						tasks: tasks,
						currentTask: newCurrentTaskIndex === -1 ? undefined : tasks[newCurrentTaskIndex],
						currentTaskIndex: newCurrentTaskIndex === -1 ? -1 : newCurrentTaskIndex
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
		await this.setStateAsync((prevState, props) => {
			return { tasks: [], currentTask: undefined, currentTaskIndex: -1, currentHistoryTask: [] };
		});
	}
				

	createOrSaveEntry = async (entryToSave) => {
		let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		if(!entryToSave._id){
			const {entry} = await EquipmentMonitorService.createEntry(currentEquipment._id, this.state.currentTask._id, entryToSave);
			await this.onNewEntry(entry);
		}
		else{
			const {entry} = await EquipmentMonitorService.saveEntry(currentEquipment._id, this.state.currentTask._id, entryToSave);
			await this.onNewEntry(entry)
		}
	}

	onNewEntry = async (newEntry) => {
		newEntry.date = new Date(newEntry.date);
		this.refreshTaskList();

		await this.setStateAsync((prevState, props) => {
			var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry._id !== newEntry._id);
			newCurrentHistoryTask.unshift(newEntry);
			newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.date - entryb.date; });

			return({ currentHistoryTask: newCurrentHistoryTask });
		});
	}
	
	deleteEntry = (entryId, onYes, onNo, onError) => {
		this.setState((prevState, props) => {
			let currentEquipment = prevState.equipments[prevState.currentEquipmentIndex];

			return {
				modalYesNo: true,
				yes: (async () => {
					this.toggleModalYesNoConfirmation();
					try{
						await EquipmentMonitorService.deleteEntry(currentEquipment._id, this.state.currentTask._id, entryId);
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
		this.refreshPosition();
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
					<NavBar position={this.state.pos} user={this.state.user} logout={this.logout} isOpened={this.state.navBar} toggle={this.toggleNavBar} />
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
							<CardTaskDetails 	task={this.state.currentTask} 
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
						saveEquipmentInfo={this.saveEquipmentInfo} 
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
						loginErrors={this.state.loginErrors}
						toggleModalSignup={this.toggleModalSignup}/>
					<ModalSignup visible={this.state.modalSignup && EquipmentMonitorService.mode === 'auth'} 
						toggle={this.toggleModalSignup} 
						data={{ firstname:'', name:'', email: '', password: ''}} 
						className='modal-dialog-centered'/>																																																					
				</div>
			</CSSTransition>
		);
	}
}

export default App;