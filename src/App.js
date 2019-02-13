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

			equipments: undefined,
			currentEquipmentIndex: undefined,
			editedEquipment: undefined,
			tasks:[],
			currentTaskIndex: undefined,
			currentTask: undefined,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', date: new Date(), age: '', remarks: '' }
		};
	}

	signup = (newuser) => {
		this.equipmentmonitorserviceproxy.signup(newuser,
			(newUser) => this.toggleModalSignup(),
			({errors}) => this.setState((prevState, props) => { return { signupErrors: errors } }));
	}

	login = (credentials) => {
		this.equipmentmonitorserviceproxy.authenticate(credentials, 
				(user) => {
					this.setState( (prevState, props) => { return { user: user, loginErrors: undefined } },
										 () => {
											this.refreshEquipmentList(() => {
												if(this.state.equipments.length > 0){
													this.changeCurrentEquipment(0);
												}
											});
										  });
				},
				({errors}) => this.setState((prevState, props) => { return { loginErrors: errors } })
		);
	}

	logout = () => {
		this.equipmentmonitorserviceproxy.logout();
		this.setState( (prevState, props) => { return { user: undefined, loginErrors: undefined } },
						() => {
							this.refreshEquipmentList();
							this.refreshTaskList();
						});
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
	
	toggleModalEditTask = (isCreationMode) => this.setState( (prevState, props) => {
													return { 
														modalEditTask: !prevState.modalEditTask,
														editedTask: isCreationMode ? createDefaultTask(prevState) : prevState.currentTask
													}
												});
	
	refreshCurrentUser = () => this.equipmentmonitorserviceproxy.refreshCurrentUser( ({user}) => this.setState((prevState, props) => { return { user:user } }),
																				  	 ()       => this.setState((prevState, props) => { return { user: undefined } }))

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
	
	changeCurrentEquipment = (newEquipmentIndex) => {
		this.setState((prevState, props) => { return ({ currentEquipmentIndex:newEquipmentIndex });},
			() => this.refreshTaskList(() => {
				if(this.state.tasks.length > 0){
					this.changeCurrentTaskIndex(0);
				}
			})
		);
	}

	saveEquipmentInfo = (equipmentInfo) => {
		this.equipmentmonitorserviceproxy.saveEquipment(equipmentInfo, ({equipment}) => {
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
		});
	}

	refreshEquipmentList = (complete) => {
		this.equipmentmonitorserviceproxy.getEquipments(
			({equipments}) => {
				if(equipments){
					equipments.forEach((equipment) => { equipment.installation = new Date(equipment.installation); });
					
					this.setState((prevState, props) => { 
							let currentEquipmentIndex = prevState.currentEquipmentIndex; 
							if (prevState.currentEquipmentIndex === undefined)
							{
								if(equipments.length > 0 ){
									currentEquipmentIndex = 0;
								}
							}
							else{
								if(equipments.length >= currentEquipmentIndex){
									currentEquipmentIndex = undefined;
								}
							}
							
							return { equipments:equipments, currentEquipmentIndex:currentEquipmentIndex } 
						},
						() => { if(typeof complete === 'function') complete(); }
					);
				}
			},
			() => this.setState((prevState, props) => {
				return { equipments:undefined, currentEquipmentIndex:undefined }
			})
		);
	}
	
	createOrSaveTask = (task) => {
		if(this.state.currentEquipmentIndex !== undefined){
			let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
			if(!task._id){
				this.equipmentmonitorserviceproxy.createTask(currentEquipment._id, task, ({task}) => this.refreshTaskList(() => this.changeCurrentTask(task)));
			}
			else{
				this.equipmentmonitorserviceproxy.saveTask(currentEquipment._id, task, ({task}) => this.refreshTaskList(() => this.changeCurrentTask(task)));
			}
		}
	}
	

	deleteTask = (onYes, onNo, onError) => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1) ? this.state.currentTaskIndex - 1:this.state.currentTaskIndex
		
		this.setState((prevState, props) => {
			let currentEquipment = prevState.equipments[prevState.currentEquipmentIndex];

			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.equipmentmonitorserviceproxy.deleteTask(currentEquipment._id, prevState.editedTask._id,
						() => {
							this.refreshTaskList(() => {
								this.changeCurrentTaskIndex(nextTaskIndex, onYes);
							});
						},
						() => { if(onError) onError(); }
					);
				}),
				no: (() => {
					this.toggleModalYesNoConfirmation();
					if(onNo) onNo();
				}),
				yesNoTitle: appmsg.taskDeleteTitle,
				yesNoMsg: appmsg.taskDeleteMsg,
			};
		});
	}
	
	nextTask = (complete, fail) => this.changeCurrentTaskIndex(this.state.currentTaskIndex + 1, complete, fail);

	previousTask = (complete, fail)=> this.changeCurrentTaskIndex(this.state.currentTaskIndex - 1, complete, fail);

	changeCurrentTask = (task, complete, fail) => {
		if(task !== this.state.currentTask){
			var newCurrentTaskIndex = this.state.tasks.findIndex((t, ind, tab) => t._id === task._id);
			this.changeCurrentTaskIndex(newCurrentTaskIndex, complete);
		}
	}

	changeCurrentTaskIndex = (newTaskIndex, complete, fail) => {
		if(newTaskIndex < -1 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		if (newTaskIndex === -1){
			this.setState((prevState, props) => { 
				return {
					currentHistoryTask: [],
					currentTaskIndex: undefined,
					currentTask: undefined
				}; 
			},
			() => { 
				if (typeof complete === 'function') 
					complete();
			});
			
			return;
		}

		let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask._id;

		this.equipmentmonitorserviceproxy.refreshHistoryTask(currentEquipment._id, newCurrentTaskId,
			({entries}) => {
				entries.forEach(entry => {
					entry.date = new Date(entry.date)
				});

				this.setState((prevState, props) => { 
					return {
						currentHistoryTask: entries,
						currentTaskIndex: newTaskIndex,
						currentTask: newCurrentTask
					}; 
				},
				() => { if(typeof complete === 'function') complete();});
			},
			() => {
				this.setState((prevState, props) => { 
					return {
						currentHistoryTask: [],
						currentTaskIndex: newTaskIndex,
						currentTask: newCurrentTask
					}; 
				},
				() => { if(typeof fail === 'function') fail();});
			}
		);
	}
	
	refreshTaskList = (complete) => {
		if(this.state.equipments && this.state.currentEquipmentIndex !== undefined){
			let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
			this.equipmentmonitorserviceproxy.refreshTaskList(currentEquipment._id, ({ tasks }) => {
				// store the new state object in the component's state
				this.setState(
					(prevState, props) => {
						tasks.forEach(task => task.usagePeriodInHour = task.usagePeriodInHour === -1 ? undefined : task.usagePeriodInHour);
						var newCurrentTaskIndex = prevState.currentTask ? tasks.findIndex(task => task._id === prevState.currentTask._id) : 0;
						return {
							tasks: tasks,
							currentTask: newCurrentTaskIndex === -1 ? undefined : tasks[newCurrentTaskIndex],
							currentTaskIndex: newCurrentTaskIndex === -1 ? undefined : newCurrentTaskIndex
						}
					},
					() =>{
						if(complete !== undefined && typeof complete === "function") complete();
					}
				);
			},
			() => {
				// store the new state object in the component's state
				this.setState((prevState, props) => { 
					return {
						tasks: [],
						currentTask: undefined,
						currentTaskIndex: undefined,
						currentHistoryTask: []
					}; 
				});
			});
		}
		else{
			this.setState((prevState, props) => { 
				return {
					tasks: [],
					currentTask: undefined,
					currentTaskIndex: undefined,
					currentHistoryTask: []
				}; 
			});
		}
	}

	createOrSaveEntry = (entry, complete) => {
		let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];
		if(!entry._id){
			this.equipmentmonitorserviceproxy.createEntry(currentEquipment._id, this.state.currentTask._id, entry, ({entry}) => this.onNewEntry(entry, complete));
		}
		else{
			this.equipmentmonitorserviceproxy.saveEntry(currentEquipment._id, this.state.currentTask._id, entry, ({entry}) => this.onNewEntry(entry, complete));
		}
	}

	onNewEntry = (newEntry, complete) => {
		newEntry.date = new Date(newEntry.date);

		this.refreshTaskList();
		this.setState((prevState, props) => {
				var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry._id !== newEntry._id);
				newCurrentHistoryTask.unshift(newEntry);
				newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.date - entryb.date; });

				return({ currentHistoryTask: newCurrentHistoryTask });
			},
			() => {
				if(complete && typeof complete === 'function')complete();
			}
		);
	}
	
	deleteEntry = (entryId, onYes, onNo, onError) => {
		this.setState((prevState, props) => {
			let currentEquipment = this.state.equipments[this.state.currentEquipmentIndex];

			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.equipmentmonitorserviceproxy.deleteEntry(currentEquipment._id, this.state.currentTask._id, entryId, 
						() => {
							this.refreshTaskList();
							this.setState((prevState, props) => {
									return({ currentHistoryTask: prevState.currentHistoryTask.slice(0).filter(e => e._id !== entryId) });
								},
								() => {
									if(onYes && typeof onYes === 'function') onYes();
								}
							);
						},
						() => { if(onError) onError(); }
					);
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

	componentDidMount() {
		this.refreshCurrentUser();
		this.refreshEquipmentList(() => {
			if(this.state.equipments.length > 0){
				this.changeCurrentEquipment(0);
			}
		});
		

		this.refreshPosition();
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