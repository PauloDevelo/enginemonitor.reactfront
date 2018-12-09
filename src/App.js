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
	NavItem,
	NavLink,
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
import EngineMonitorServiceProxy from './EngineMonitorServiceProxy';

import './transition.css';
import appmsg from "./App.messages";

function createDefaultEntry(state){
	return {
		name: state.currentTask.name,
		UTCDate: new Date(),
		age: state.engineInfo.age,
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

			modalEngineInfo: false,
			modalEditTask: false,
			modalEditEntry: false,
			modalYesNo: false,
			navBar: true,

			yes: (() => {}),
			no: (() => {}),

			yesNoTitle: appmsg.defaultTitle,
			yesNoMsg: appmsg.defaultMsg,

			engineInfo: undefined,
			tasks:[],
			currentTaskIndex: undefined,
			currentTask: undefined,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', UTCDate: new Date(), age: '', remarks: '' }
		};
	}

	login = (credentials) => {
		this.enginemonitorserviceproxy.authenticate(credentials, 
				(user) => {
					this.setState( (prevState, props) => { return { user: user, loginErrors: undefined } },
										 () => {
											this.refreshEngineInfo();
											this.refreshTaskList();
										  });
				},
				({errors}) => this.setState((prevState, props) => { return { loginErrors: errors } })
		);
	}

	logout = () => {
		this.setState( (prevState, props) => { return { user: undefined, loginErrors: undefined } },
						() => {
						this.refreshEngineInfo();
						this.refreshTaskList();
						});
		this.enginemonitorserviceproxy.logout();
	}

	toggleNavBar = () => this.setState((prevState, props) => {return { navBar: !prevState.navBar }});

	toggleModalYesNoConfirmation = () => this.setState((prevState, props) => {return { modalYesNo: !prevState.modalYesNo }});

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
	
	toggleModalEngineInfo = () => this.setState((prevState, props) => {return { modalEngineInfo: !prevState.modalEngineInfo }});
	
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
	
	saveEngineInfo = (engineInfo) => this.enginemonitorserviceproxy.saveEngineInfo(engineInfo, (newEngineInfo) => {
		newEngineInfo.installation = new Date(newEngineInfo.installation);
		this.setState((prevState, props) => { return { engineInfo:newEngineInfo } });
	});

	refreshEngineInfo = () => this.enginemonitorserviceproxy.refreshEngineInfo(
		(newEngineInfo) => {
			newEngineInfo.installation = new Date(newEngineInfo.installation);
			this.setState((prevState, props) => { return { engineInfo:newEngineInfo } });
		},
		() => {
			this.setState((prevState, props) => { return { engineInfo: undefined } });
		}
	);
	
	createOrSaveTask = (task) => this.enginemonitorserviceproxy.createOrSaveTask(task, (newtask) => this.refreshTaskList(() => this.changeCurrentTask(newtask)));
	

	deleteTask = (onYes, onNo, onError) => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1)?this.state.currentTaskIndex - 1:this.state.currentTaskIndex
		
		this.setState((prevState, props) => {
			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.enginemonitorserviceproxy.deleteTask(prevState.editedTask.id,
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
			var newCurrentTaskIndex = this.state.tasks.findIndex((t, ind, tab) => t.id === task.id);
			this.changeCurrentTaskIndex(newCurrentTaskIndex, complete);
		}
	}

	changeCurrentTaskIndex = (newTaskIndex, complete, fail) => {
		if(newTaskIndex < 0 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask.id;

		this.enginemonitorserviceproxy.refreshHistoryTask(newCurrentTaskId,
			(newHistoryTask) => {
				newHistoryTask.forEach(entry => {
					entry.UTCDate = new Date(entry.UTCDate)
				});

				this.setState((prevState, props) => { 
					return {
						currentHistoryTask: newHistoryTask,
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
	
	refreshTaskList = (complete) => this.enginemonitorserviceproxy.refreshTaskList( (newTaskList) => {
			// store the new state object in the component's state
			this.setState(
				(prevState, props) => {
					newTaskList.forEach(task => task.engineHours = task.engineHours === -1?undefined:task.engineHours);
					var newCurrentTaskIndex = prevState.currentTask?newTaskList.findIndex(task => task.id === prevState.currentTask.id):0;
					return {
						tasks: newTaskList,
						currentTask: newTaskList[newCurrentTaskIndex],
						currentTaskIndex: newCurrentTaskIndex
					}
				},
				() =>{
					if(complete !== undefined && typeof complete === "function")complete();
				}
			);
		},
		() => {
			// store the new state object in the component's state
			this.setState((prevState, props) => { 
				return {
					tasks: [],
					currentTask: undefined,
					currentTaskIndex: undefined
				}; 
			});
		}
	);

	createOrSaveEntry = (entry, complete) => this.enginemonitorserviceproxy.createOrSaveEntry(this.state.currentTask.id, entry, (newEntry) => {
		newEntry.UTCDate = new Date(newEntry.UTCDate);

		this.refreshTaskList();
		this.setState((prevState, props) => {
			var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry.id !== newEntry.id);
			newCurrentHistoryTask.unshift(newEntry);
			newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.UTCDate - entryb.UTCDate; });

			return({ currentHistoryTask: newCurrentHistoryTask });
			},
			() => {
				if(complete && typeof complete === 'function')complete();
			}
		)});
	
	deleteEntry = (entryId, onYes, onNo, onError) => {
		this.setState((prevState, props) => {
			return {
				modalYesNo: true,
				yes: (() => {
					this.toggleModalYesNoConfirmation();
					this.enginemonitorserviceproxy.deleteEntry(this.state.currentTask.id, entryId, 
						() => {
							this.refreshTaskList();
							this.setState((prevState, props) => {
									return({ currentHistoryTask: prevState.currentHistoryTask.slice(0).filter(e => e.id !== entryId) });
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
		this.refreshEngineInfo();
		this.refreshTaskList(() => {
			if (this.state.currentTaskIndex === undefined){
				this.changeCurrentTaskIndex(0);
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
							<EngineInfo data={this.state.engineInfo} 
										toggleModal={this.toggleModalEngineInfo}
										classNames={panelClassNames}/>
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
						saveEngineInfo={this.saveEngineInfo} 
						data={this.state.engineInfo}
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

					<ModalLogin visible={this.state.user === undefined && this.enginemonitorserviceproxy.mode === 'auth'} 
					login={this.login}
					data={{ email: '', password: ''}} 
					className='modal-dialog-centered'
					loginErrors={this.state.loginErrors}/>

				</div>
			</CSSTransition>
		);
	}
}

export default App;