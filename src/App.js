import React, { Component } from 'react';

import EngineInfo from './EngineInfo';
import ModalEngineInfo from './ModalEngineInfo';
import TaskTable from './TaskTable';
import ModalEditTask from './ModalEditTask';
import HistoryTaskTable from './HistoryTaskTable'
import CardTaskDetails from './CardTaskDetails'

import ModalEditEntry from './ModalEditEntry';
import EngineMonitorServiceProvider from './EngineMonitorServiceProvider';

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

	enginemonitorserviceprov= new EngineMonitorServiceProvider();

	constructor(props) {
		super(props);

		this.state = {
			modalEngineInfo: false,
			modalEditTask: false,
			modalEditEntry: false,

			engineInfo: undefined,
			tasks:[],
			currentTaskIndex:undefined,
			currentTask:undefined,
			editedTask: createDefaultTask(),
			
			currentHistoryTask: [],
			editedEntry:{ name: '', UTCDate: new Date(), age: '', remarks: '' }
		};
	}

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
	
	
	saveEngineInfo = (engineInfo) => this.enginemonitorserviceprov.saveEngineInfo(engineInfo, (newEngineInfo) => {
		newEngineInfo.installation = new Date(newEngineInfo.installation);
		this.setState((prevState, props) => { return { engineInfo:newEngineInfo } });
	});

	refreshEngineInfo = () => this.enginemonitorserviceprov.refreshEngineInfo(
		(newEngineInfo) => {
			newEngineInfo.installation = new Date(newEngineInfo.installation);
			this.setState((prevState, props) => { return { engineInfo:newEngineInfo } });
		},
		() => {
			this.setState((prevState, props) => { return { engineInfo: undefined } });
		}
	);
	
	createOrSaveTask = (task) => this.enginemonitorserviceprov.createOrSaveTask(task, (newtask) => this.refreshTaskList(() => this.changeCurrentTask(newtask)));
	

	deleteTask = (complete) => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1)?this.state.currentTaskIndex - 1:this.state.currentTaskIndex

		this.enginemonitorserviceprov.deleteTask(this.state.editedTask.id,
			() => this.refreshTaskList(() => this.changeCurrentTaskIndex(nextTaskIndex))
		);
	}
	
	nextTask = () => this.changeCurrentTaskIndex(this.state.currentTaskIndex + 1);

	previousTask = ()=> this.changeCurrentTaskIndex(this.state.currentTaskIndex - 1);

	changeCurrentTask = (task) => {
		if(task !== this.state.currentTask){
			var newCurrentTaskIndex = this.state.tasks.findIndex((t, ind, tab) => t.id === task.id);
			this.changeCurrentTaskIndex(newCurrentTaskIndex);
		}
	}

	changeCurrentTaskIndex = (newTaskIndex) => {
		if(newTaskIndex < 0 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask.id;

		this.enginemonitorserviceprov.refreshHistoryTask(newCurrentTaskId,
			(newHistoryTask) => {
				newHistoryTask.forEach(entry => {
					entry.UTCDate = new Date(entry.UTCDate)
				});
			
				this.setState(function(prevState, props){ 
					return {
						currentHistoryTask: newHistoryTask,
						currentTaskIndex: newTaskIndex,
						currentTask: newCurrentTask
					}; 
				});
			},
			() => {
				this.setState(function(prevState, props){ 
					return {
						currentHistoryTask: [],
						currentTaskIndex: newTaskIndex,
						currentTask: newCurrentTask
					}; 
				});
			}
		);
	}
	
	refreshTaskList = (complete) => this.enginemonitorserviceprov.refreshTaskList(
		(newTaskList) => {
			// store the new state object in the component's state
			this.setState(
				(prevState, props) => {
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

	createOrSaveEntry = (entry, complete) => this.enginemonitorserviceprov.createOrSaveEntry(this.state.currentTask.id, entry, 
			(newEntry) => {
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
				)
			}
		);
	
	deleteEntry = (entryId, complete) => this.enginemonitorserviceprov.deleteEntry(this.state.currentTask.id, entryId, 
			() => {
				this.refreshTaskList();
				this.setState((prevState, props) => {
						return({ currentHistoryTask: prevState.currentHistoryTask.slice(0).filter(e => e.id !== entryId) });
					},
					() => {
						if(complete && typeof complete === 'function')complete();
					}
				);
			}
		);

	componentDidMount() {
		this.refreshEngineInfo();
		this.refreshTaskList(() => {
			if (this.state.currentTaskIndex === undefined){
				this.changeCurrentTaskIndex(0);
			}
		});
	}
    
	render() {
		var panelClassNames = "p-2 m-2 border border-primary rounded shadow";
		var prevVisibility = this.state.currentTaskIndex > 0;
		var nextVisibility = this.state.currentTaskIndex < this.state.tasks.length - 1;
		return (
			<div>
				<div id="root" className="d-flex flex-wrap flex-row mb-3">
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
				/>
				<ModalEditTask visible={this.state.modalEditTask} 
					toggle={this.toggleModalEditTask} 
					saveTask={this.createOrSaveTask} 
					deleteTask={this.deleteTask}
					task={this.state.editedTask}
				/>
				<ModalEditEntry visible={this.state.modalEditEntry}
					toggle={this.toggleModalEditEntry} 
					saveEntry={this.createOrSaveEntry} 
					deleteEntry={this.deleteEntry}
					entry={this.state.editedEntry}
				/>
			</div>
		);
	}
}

export default App;