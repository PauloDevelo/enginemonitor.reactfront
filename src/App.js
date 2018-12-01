import React, { Component } from 'react';

import EngineInfo from './EngineInfo';
import ModalEngineInfo from './ModalEngineInfo';
import TaskTable from './TaskTable';
import ModalEditTask from './ModalEditTask';
import HistoryTaskTable from './HistoryTaskTable'
import CardTaskDetails from './CardTaskDetails'

import {formatDateInUTC} from './Helpers' 

import axios from "axios";
import axiosRetry from 'axios-retry';
import ModalEditEntry from './ModalEditEntry';

var mode = 'dev'; //prod or demo
var baseUrl = "http://localhost:8081";
if(mode === 'prod'){
	baseUrl = "http://arbutuspi:8080";
}
else if(mode === 'demo'){
	baseUrl = "http://192.168.0.50:8080";
}

function createDefaultEntry(state){
	return {
		name: state.currentTask.name,
		UTCDate: new Date(),
		age: state.age,
		remarks: '',
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modalEngineInfo: false,
			modalEditTask: false,
			modalEditEntry: false,

			brand: undefined,
			model: undefined,
			age: undefined,
			installation: new Date(),
			
			tasks:[],
			currentTaskIndex:undefined,
			currentTask:undefined,
			editedTask:undefined,
			
			currentHistoryTask: [],
			editedEntry:{
				name: '',
				UTCDate: new Date(),
				age: '',
				remarks: '',
			}
		};

		this.toggleModalEngineInfo = this.toggleModalEngineInfo.bind(this);
		this.toggleModalEditTask = this.toggleModalEditTask.bind(this);
		this.toggleModalEditEntry = this.toggleModalEditEntry.bind(this);

		this.saveEngineInfo = this.saveEngineInfo.bind(this);
		this.refreshEngineInfo = this.refreshEngineInfo.bind(this);

		this.refreshTaskList = this.refreshTaskList.bind(this);
		this.createOrSaveTask = this.createOrSaveTask.bind(this);
		this.changeCurrentTaskIndex = this.changeCurrentTaskIndex.bind(this);
		this.changeCurrentTask = this.changeCurrentTask.bind(this);
		this.deleteTask = this.deleteTask.bind(this);
		this.nextTask = this.nextTask.bind(this);
		this.previousTask = this.previousTask.bind(this);

		this.createOrSaveEntry = this.createOrSaveEntry.bind(this);
		this.deleteEntry = this.deleteEntry.bind(this);
		
		axiosRetry(axios, { retries: 60, retryDelay: () => 1000 });
	}

	toggleModalEditEntry(isCreationMode, entry) {
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
	
	toggleModalEngineInfo() {
    	this.setState((prevState, props) => { return { modalEngineInfo: !prevState.modalEngineInfo }; });
  	}
	
	toggleModalEditTask(isCreationMode) {
    	this.setState( (prevState, props) => {
				return { 
					modalEditTask: !prevState.modalEditTask,
					editedTask: isCreationMode?undefined:prevState.currentTask
				}
			});
	}
	  
	
	
	saveEngineInfo(engineInfo){
		engineInfo.installation = formatDateInUTC(engineInfo.installation);
		axios.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo", engineInfo)
		.then(response => {
			this.setState(
				function (prevState, props){
					return { 
						brand: response.data.brand,
						model: response.data.model,
						age: response.data.age,
						installation: new Date(response.data.installation)
					}
				});
		})
		.catch(error => {
			console.log( error );
		});
	}

	refreshEngineInfo(){
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo")
      	.then(response => {
        	// create a new "State" object without mutating 
			// the original State object. 
			const newState = Object.assign({}, this.state, {
				brand: response.data.brand,
				model: response.data.model,
				age: response.data.age,
				installation: new Date(response.data.installation)
			});

			// store the new state object in the component's state
			this.setState((prevState, props) => newState);
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				brand: undefined,
				model: undefined,
				age: undefined,
				installation: Date.now()
			});

			// store the new state object in the component's state
			this.setState((prevState, props) => newState);
		});
	}
	
	createOrSaveTask(task){
		axios
		.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks", task)
		.then(response => {
			this.refreshTaskList(() => this.changeCurrentTask(response.data));
		})
		.catch(error => {
			console.log( error );
		});
	}

	deleteTask(complete){
		var nextTaskIndex = 0
		if(this.state.currentTaskIndex === this.state.tasks.length - 1)
			nextTaskIndex = this.state.currentTaskIndex - 1;
		else
			nextTaskIndex = this.state.currentTaskIndex;

		axios
		.delete(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + this.state.editedTask.id)
		.then(response => {
			this.refreshTaskList(()=>{
				if(nextTaskIndex >= 0){
					this.changeCurrentTaskIndex(nextTaskIndex);
				}
			});
		})
		.catch(error => {
			console.log( error );
		});
	}
	
	nextTask(){
		this.changeCurrentTaskIndex(this.state.currentTaskIndex + 1);
	}

	previousTask(){
		this.changeCurrentTaskIndex(this.state.currentTaskIndex - 1);
	}

	changeCurrentTask(task){
		if(task !== this.state.currentTask){
			var newCurrentTaskIndex = this.state.tasks.findIndex((t, ind, tab) => t.id === task.id);
			this.changeCurrentTaskIndex(newCurrentTaskIndex);
		}
	}

	changeCurrentTaskIndex(newTaskIndex){
		if(newTaskIndex < 0 || newTaskIndex >= this.state.tasks.length){
			console.log('Index out of bound: ' + newTaskIndex);
			return;
		}

		var newCurrentTask = this.state.tasks[newTaskIndex];
		var newCurrentTaskId = newCurrentTask.id;
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + newCurrentTaskId + "/historic")
      	.then(response => {	
			response.data.forEach(entry => {
				entry.UTCDate = new Date(entry.UTCDate)
			});
			// create a new "State" object without mutating 
			// the original State object.
			const newState = Object.assign({}, this.state, {
				currentHistoryTask: response.data,
				currentTaskIndex: newTaskIndex,
				currentTask: newCurrentTask
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				currentHistoryTask: [],
				currentTaskIndex: newTaskIndex,
				currentTask: newCurrentTask
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
		});
	}
	
	refreshTaskList(complete){
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks")
      	.then(response => {	
			// store the new state object in the component's state
			this.setState((prevState, props) => {
					var newCurrentTaskIndex = prevState.currentTask?response.data.findIndex(task => task.id === prevState.currentTask.id):0;
					return {
						tasks: response.data,
						currentTask: response.data[newCurrentTaskIndex],
						currentTaskIndex: newCurrentTaskIndex
					}
				},
				() =>{
					if(complete !== undefined && typeof complete === "function"){
						complete();
					}
				}
			);
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				tasks: [],
				currentTask: undefined,
				currentTaskIndex: undefined
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
		});
	}

	createOrSaveEntry(entry, complete){
		entry.UTCDate = formatDateInUTC(entry.UTCDate);
		axios
		.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + this.state.currentTask.id + "/historic", entry)
		.then(response => {
			response.data.UTCDate = new Date(response.data.UTCDate);

			this.refreshTaskList();
			this.setState((prevState, props) => {
				var newCurrentHistoryTask = prevState.currentHistoryTask.filter(entry => entry.id !== response.data.id);
				
				newCurrentHistoryTask.unshift(response.data);
				newCurrentHistoryTask.sort((entrya, entryb) => {
					return entrya.UTCDate - entryb.UTCDate;
				});

				return({ 
						currentHistoryTask: newCurrentHistoryTask
					});
				},
				() => {
					if(complete && typeof complete === 'function')
						complete();
				}
			)
		})
		.catch(error => {
			console.log( error );
		});
	}
	
	deleteEntry(entryId, complete){
		axios
		.delete(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + this.state.currentTask.id + "/historic/" + entryId)
		.then(response => {
			this.refreshTaskList();
			this.setState((prevState, props) => {
				return({ 
						currentHistoryTask: prevState.currentHistoryTask.slice(0).filter(e => e.id !== entryId) 
					});
				},
				() => {
					if(complete && typeof complete === 'function')
						complete();
				}
			);
		})	
		.catch(error => {
			console.log( error );
		});
	}

	componentDidMount() {
		this.refreshEngineInfo();
		this.refreshTaskList(() => 
			{
				if (this.state.currentTaskIndex === undefined){
					this.changeCurrentTaskIndex(0);
				}
			});
	}
    
	render() {
		var prevVisibility = this.state.currentTaskIndex > 0;
		var nextVisibility = this.state.currentTaskIndex < this.state.tasks.length - 1;
		return (
			<div>
				<div id="root" className="d-flex flex-wrap flex-row mb-3">
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<EngineInfo brand={this.state.brand} 
									model={this.state.model} 
									age={this.state.age} 
									installation={this.state.installation} 
									toggleModal={this.toggleModalEngineInfo}/>
						<TaskTable 	tasks={this.state.tasks} 
									toggleModal={() => this.toggleModalEditTask(true)} 
									changeCurrentTask={this.changeCurrentTask}/>
					</div>
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<CardTaskDetails 	task={this.state.currentTask} 
											toggleModal={() => this.toggleModalEditTask(false)} 
											next={this.nextTask} 
											prev={this.previousTask} 
											prevVisibility={prevVisibility} 
											nextVisibility={nextVisibility} 
											toggleAckModal={()=>this.toggleModalEditEntry(true)}/>
						<HistoryTaskTable 	taskHistory={this.state.currentHistoryTask} 
											toggleEntryModal={this.toggleModalEditEntry}/>
					</div>
				</div>
				
				<ModalEngineInfo visible={this.state.modalEngineInfo} 
					toggle={this.toggleModalEngineInfo} 
					save={this.saveEngineInfo} 
					brand={this.state.brand} 
					model={this.state.model} 
					age={this.state.age} 
					installation={this.state.installation}
				/>
				<ModalEditTask visible={this.state.modalEditTask} 
					toggle={this.toggleModalEditTask} 
					save={this.createOrSaveTask} 
					delete={this.deleteTask}
					task={this.state.editedTask}
				/>
				<ModalEditEntry visible={this.state.modalEditEntry}
					toggle={this.toggleModalEditEntry} 
					save={this.createOrSaveEntry} 
					delete={this.deleteEntry}
					entry={this.state.editedEntry}
				/>
			</div>
		);
	}
}

export default App;
