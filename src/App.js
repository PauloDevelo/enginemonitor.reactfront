import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CSSTransition } from 'react-transition-group'
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem } from 'reactstrap';
  
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
import EquipmentMonitorServiceProxy from './EquipmentMonitorServiceProxy';
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

	equipmentmonitorserviceproxy = new EquipmentMonitorServiceProxy();

	constructor(props) {
		super(props);

		this.state = {
			pos: undefined,
			user: {},
			loginErrors: undefined,
			signupErrors: undefined,

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

	signup = async (newuser) => {
		try{
			await this.equipmentmonitorserviceproxy.signup(newuser);
			this.toggleModalSignup();
		}
		catch(errors){
			if(errors instanceof HttpError){
				this.setState((prevState, props) => { return { signupErrors: errors.data } });
			}
		}
	}

	login = async (credentials) => {
		try{
			const user = await this.equipmentmonitorserviceproxy.authenticate(credentials);
			await this.setStateAsync((prevState, props) => { return { user: user, loginErrors: undefined } });
			await this.refreshEquipmentList();

			if(this.state.equipments.length > 0){
				this.changeCurrentEquipment(0);
			}
		}
		catch(errors){
			if(errors instanceof HttpError){
				this.setState((prevState, props) => { return { loginErrors: errors.data } });
			}
		}
	}

	logout = async () => {
		this.equipmentmonitorserviceproxy.logout();
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
			const {user} = await this.equipmentmonitorserviceproxy.refreshCurrentUser();
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
		await this.setStateAsync((prevState, props) => { return ({ currentEquipmentIndex:newEquipmentIndex });});
		await this.refreshTaskList();

		if(this.state.tasks.length > 0){
			this.changeCurrentTaskIndex(0);
		}
	}

	saveEquipmentInfo = async (equipmentInfo) => {
		const {equipment} = await this.equipmentmonitorserviceproxy.saveEquipment(equipmentInfo);
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
			const {equipments} = await this.equipmentmonitorserviceproxy.getEquipments();
			equipments.forEach((equipment) => { equipment.installation = new Date(equipment.installation); });
			
			await this.setStateAsync((prevState, props) => { 
					let currentEquipmentIndex = prevState.currentEquipmentIndex; 
					if (currentEquipmentIndex === -1)
					{
						if(equipments.length > 0 ){
							currentEquipmentIndex = 0;
						}
					}
					else{
						if(currentEquipmentIndex >= equipments.length){
							currentEquipmentIndex = -1;
						}
					}
					
					return { equipments:equipments, currentEquipmentIndex:currentEquipmentIndex } 
				}
			);
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
			const {task} = await this.equipmentmonitorserviceproxy.createTask(currentEquipment._id, taskToSave);
			saveTask = task;
			
		}
		else{
			const {task} = await this.equipmentmonitorserviceproxy.saveTask(currentEquipment._id, taskToSave);
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
						await this.equipmentmonitorserviceproxy.deleteTask(currentEquipment._id, prevState.editedTask._id);
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
			const {entries} = await this.equipmentmonitorserviceproxy.refreshHistoryTask(currentEquipment._id, newCurrentTaskId);
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
				const { tasks } = await this.equipmentmonitorserviceproxy.refreshTaskList(currentEquipment._id);
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
			const {entry} = await this.equipmentmonitorserviceproxy.createEntry(currentEquipment._id, this.state.currentTask._id, entryToSave);
			await this.onNewEntry(entry);
		}
		else{
			const {entry} = await this.equipmentmonitorserviceproxy.saveEntry(currentEquipment._id, this.state.currentTask._id, entryToSave);
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
						await this.equipmentmonitorserviceproxy.deleteEntry(currentEquipment._id, this.state.currentTask._id, entryId);
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
		let position = this.state.pos ? '(' + this.state.pos.lng.toFixed(4) + ', ' + this.state.pos.lat.toFixed(4) + ')':'';
		let textMenu = this.state.user?this.state.user.email:"Login";
		var panelClassNames = "p-2 m-2 border border-secondary rounded shadow";
		var prevVisibility = this.state.currentTaskIndex > 0;
		var nextVisibility = this.state.currentTaskIndex < this.state.tasks.length - 1;
		return (
			<CSSTransition in={true} appear={true} timeout={1000} classNames="fade">
				<div id="root">
					<Navbar color="dark" dark expand="md">
						<NavbarBrand href="/">Equipment maintenance {position}</NavbarBrand>
						<NavbarToggler onClick={this.toggleNavBar} />
						<Collapse isOpen={this.state.navBar} navbar>
							<Nav className="ml-auto" navbar>
								<UncontrolledDropdown nav inNavbar>
									<DropdownToggle nav caret>
									{textMenu}
									</DropdownToggle>
									<DropdownMenu right>
										<DropdownItem onClick={this.logout}>
										<FontAwesomeIcon icon={faSignOutAlt} />{' '}<FormattedMessage {...appmsg.signout} />
										</DropdownItem>
									</DropdownMenu>
								</UncontrolledDropdown>
							</Nav>
						</Collapse>
					</Navbar>

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
					<ModalLogin visible={this.state.user === undefined && this.equipmentmonitorserviceproxy.mode === 'auth'} 
						login={this.login}
						data={{ email: '', password: ''}} 
						className='modal-dialog-centered'
						loginErrors={this.state.loginErrors}
						toggleModalSignup={this.toggleModalSignup}/>
					<ModalSignup visible={this.state.modalSignup && this.equipmentmonitorserviceproxy.mode === 'auth'} 
						toggle={this.toggleModalSignup} 
						signup={this.signup}
						data={{ firstname:'', name:'', email: '', password: ''}} 
						className='modal-dialog-centered'
						signupErrors={this.state.signupErrors}/>																																																					

				</div>
			</CSSTransition>
		);
	}
}

export default App;