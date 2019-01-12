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
  
import EngineInfo from './EngineInfo';
import ModalEngineInfo from './ModalEngineInfo';
import TaskTable from './TaskTable';
import ModalEditTask from './ModalEditTask';
import HistoryTaskTable from './HistoryTaskTable'
import CardTaskDetails from './CardTaskDetails'
import ModalYesNoConfirmation from './ModalYesNoConfirmation'
import ModalEditEntry from './ModalEditEntry';
import ModalLogin from './ModalLogin';
import ModalSignup from './ModalSignup';
import EngineMonitorServiceProxy from './EngineMonitorServiceProxy';

import './transition.css';
import appmsg from "./App.messages";

function createDefaultBoats(state){
	return {
		name: "",
		engineBrand: "",
		engineModel: "",
		engineAge: "",
		engineInstallation: new Date()
	}
}

function createDefaultEntry(state){
	return {
		name: state.currentTask.name,
		UTCDate: new Date(),
		age: state.boats[state.currentBoatIndex].engineAge,
		remarks: '',
	}
}

function createDefaultTask(state){
	return {
		name: '',
		engineHours: 100,
		month: 12,
		description: ''
	}
}

class App extends Component {

	enginemonitorserviceproxy = new EngineMonitorServiceProxy();

	constructor(props) {
		super(props);

		this.state = {
			pos: undefined,
			user: {},
			loginErrors: undefined,
			signupErrors: undefined,

			modalEngineInfo: false,
			modalEditTask: false,
			modalEditEntry: false,
			modalYesNo: false,
			modalSignup: false,
			navBar: true,

			yes: (() => {}),
			no: (() => {}),

			yesNoTitle: appmsg.defaultTitle,
			yesNoMsg: appmsg.defaultMsg,

			boats: undefined,
			currentBoatIndex: undefined,
			editedBoat: undefined,
			tasks:[],
			currentTaskIndex: undefined,
			currentTask: undefined,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', UTCDate: new Date(), age: '', remarks: '' }
		};
	}

	signup = (newuser) => {
		this.enginemonitorserviceproxy.signup(newuser,
			(newUser) => this.toggleModalSignup(),
			({errors}) => this.setState((prevState, props) => { return { signupErrors: errors } }));
	}

	login = (credentials) => {
		this.enginemonitorserviceproxy.authenticate(credentials, 
				(user) => {
					this.setState( (prevState, props) => { return { user: user, loginErrors: undefined } },
										 () => {
											this.refreshBoatList(() => {
												if(this.state.boats.length > 0){
													this.changeCurrentBoat(0);
												}
											});
										  });
				},
				({errors}) => this.setState((prevState, props) => { return { loginErrors: errors } })
		);
	}

	logout = () => {
		this.enginemonitorserviceproxy.logout();
		this.setState( (prevState, props) => { return { user: undefined, loginErrors: undefined } },
						() => {
							this.refreshBoatList();
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
	
	toggleModalEngineInfo = (isCreationMode) => {
		this.setState((prevState, props) => {
			let newState = { modalEngineInfo: !prevState.modalEngineInfo };

			if(isCreationMode !== undefined){
				newState.editedBoat = isCreationMode?createDefaultBoats(prevState):prevState.boats[prevState.currentBoatIndex];
			}

			return newState;
		});
	}
	
	toggleModalEditTask = (isCreationMode) => this.setState( (prevState, props) => {
													return { 
														modalEditTask: !prevState.modalEditTask,
														editedTask: isCreationMode?createDefaultTask(prevState):prevState.currentTask
													}
												});
	
	refreshCurrentUser = () => this.enginemonitorserviceproxy.refreshCurrentUser( ({user}) => this.setState((prevState, props) => { return { user:user } }),
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
	
	changeCurrentBoat = (newBoatIndex) => {
		this.setState((prevState, props) => { return ({ currentBoatIndex:newBoatIndex });},
			() => this.refreshTaskList(() => {
				if(this.state.tasks.length > 0){
					this.changeCurrentTaskIndex(0);
				}
			})
		);
	}

	saveBoatInfo = (boatInfo) => {
		this.enginemonitorserviceproxy.saveBoat(boatInfo, ({boat}) => {
			boat.engineInstallation = new Date(boat.engineInstallation);

			if(boatInfo._id){
				this.setState((prevState, props) => {
					prevState.boats[prevState.currentBoatIndex] = boat;
					return prevState; 
				});
			}
			else{
				this.setState((prevState, props) => {
					prevState.boats.push(boat);
					return prevState; 
				});
			}
		});
	}

	refreshBoatList = (complete) => {
		this.enginemonitorserviceproxy.getBoats(
			({boats}) => {
				if(boats){
					boats.forEach((boat) => { boat.engineInstallation = new Date(boat.engineInstallation); });
					
					this.setState((prevState, props) => { 
							let currentBoatIndex = prevState.currentBoatIndex; 
							if (prevState.currentBoatIndex === undefined)
							{
								if(boats.length > 0 ){
									currentBoatIndex = 0;
								}
							}
							else{
								if(boats.length >= currentBoatIndex){
									currentBoatIndex = undefined;
								}
							}
							
							return { boats:boats, currentBoatIndex:currentBoatIndex } 
						},
						() => { if(typeof complete === 'function') complete(); }
					);
				}
			},
			() => this.setState((prevState, props) => {
				return { boats:undefined, currentBoatIndex:undefined }
			})
		);
	}
	
	createOrSaveTask = (task) => {
		if(this.state.currentBoatIndex !== undefined){
			let currentBoat = this.state.boats[this.state.currentBoatIndex];
			if(!task._id){
				this.enginemonitorserviceproxy.createTask(currentBoat._id, task, ({task}) => this.refreshTaskList(() => this.changeCurrentTask(task)));
			}
			else{
				this.enginemonitorserviceproxy.saveTask(currentBoat._id, task, ({task}) => this.refreshTaskList(() => this.changeCurrentTask(task)));
			}
		}
	}
	

	deleteTask = (onYes, onNo, onError) => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1)?this.state.currentTaskIndex - 1:this.state.currentTaskIndex
		
		this.setState((prevState, props) => {
			let currentBoat = prevState.boats[prevState.currentBoatIndex];

			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.enginemonitorserviceproxy.deleteTask(currentBoat._id, prevState.editedTask._id,
						() => this.refreshTaskList(() => this.changeCurrentTaskIndex(nextTaskIndex, onYes)),
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
		if(newTaskIndex < 0 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		let currentBoat = this.state.boats[this.state.currentBoatIndex];
		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask._id;

		this.enginemonitorserviceproxy.refreshHistoryTask(currentBoat._id, newCurrentTaskId,
			({entries}) => {
				entries.forEach(entry => {
					entry.UTCDate = new Date(entry.UTCDate)
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
		if(this.state.boats && this.state.currentBoatIndex !== undefined){
			let currentBoat = this.state.boats[this.state.currentBoatIndex];
			this.enginemonitorserviceproxy.refreshTaskList(currentBoat._id, ({ tasks }) => {
				// store the new state object in the component's state
				this.setState(
					(prevState, props) => {
						tasks.forEach(task => task.engineHours = task.engineHours === -1 ? undefined : task.engineHours);
						var newCurrentTaskIndex = prevState.currentTask ? tasks.findIndex(task => task._id === prevState.currentTask._id) : 0;
						return {
							tasks: tasks,
							currentTask: tasks[newCurrentTaskIndex],
							currentTaskIndex: newCurrentTaskIndex
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
		let currentBoat = this.state.boats[this.state.currentBoatIndex];
		if(!entry._id){
			this.enginemonitorserviceproxy.createEntry(currentBoat._id, this.state.currentTask._id, entry, ({entry}) => this.onNewEntry(entry, complete));
		}
		else{
			this.enginemonitorserviceproxy.saveEntry(currentBoat._id, this.state.currentTask._id, entry, (entry) => this.onNewEntry(entry, complete));
		}
	}

	onNewEntry = (newEntry, complete) => {
		newEntry.UTCDate = new Date(newEntry.UTCDate);

		this.refreshTaskList();
		this.setState((prevState, props) => {
				var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry._id !== newEntry._id);
				newCurrentHistoryTask.unshift(newEntry);
				newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.UTCDate - entryb.UTCDate; });

				return({ currentHistoryTask: newCurrentHistoryTask });
			},
			() => {
				if(complete && typeof complete === 'function')complete();
			}
		);
	}
	
	deleteEntry = (entryId, onYes, onNo, onError) => {
		this.setState((prevState, props) => {
			let currentBoat = this.state.boats[this.state.currentBoatIndex];

			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.enginemonitorserviceproxy.deleteEntry(currentBoat._id, this.state.currentTask._id, entryId, 
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
		this.refreshBoatList(() => {
			if(this.state.boats.length > 0){
				this.changeCurrentBoat(0);
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
						<NavbarBrand href="/">Engine monitor {position}</NavbarBrand>
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
							<EngineInfo boats={this.state.boats}
										currentBoatIndex={this.state.currentBoatIndex}
										changeCurrentBoat={this.changeCurrentBoat}
										toggleModal={this.toggleModalEngineInfo}
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
					
					<ModalEngineInfo visible={this.state.modalEngineInfo} 
						toggle={this.toggleModalEngineInfo} 
						saveBoatInfo={this.saveBoatInfo} 
						data={this.state.editedBoat}
						className='modal-dialog-centered'
					/>
					<ModalEditTask visible={this.state.modalEditTask} 
						toggle={this.toggleModalEditTask} 
						saveTask={this.createOrSaveTask.bind(this)} 
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
					<ModalLogin visible={this.state.user === undefined && this.enginemonitorserviceproxy.mode === 'auth'} 
						login={this.login}
						data={{ email: '', password: ''}} 
						className='modal-dialog-centered'
						loginErrors={this.state.loginErrors}
						toggleModalSignup={this.toggleModalSignup}/>
					<ModalSignup visible={this.state.modalSignup && this.enginemonitorserviceproxy.mode === 'auth'} 
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