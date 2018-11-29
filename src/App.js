
import React, { Component } from 'react';

import EngineInfo from './EngineInfo';
import ModalEngineInfo from './ModalEngineInfo';
import TaskTable from './TaskTable';
import ModalEditTask from './ModalEditTask';
import CarouselTaskDetails from './CarouselTaskDetails'
import HistoryTaskTable from './HistoryTaskTable'

import axios from "axios";
import axiosRetry from 'axios-retry';

var mode = 'dev'; //prod or demo
var baseUrl = "http://localhost:8081";
if(mode === 'prod'){
	baseUrl = "http://arbutuspi:8080";
}
else if(mode === 'demo'){
	baseUrl = "http://192.168.0.50:8080";
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			modalEngineInfo: false,
			modalEditTask: false,

			brand: undefined,
			model: undefined,
			age: undefined,
			installation: new Date(),
			
			tasks:[],
			editedTask:undefined,
			currentTask:undefined,
			currentHistoryTask: []
		};

		this.toggleModalEngineInfo = this.toggleModalEngineInfo.bind(this);
		this.toggleModalEditTask = this.toggleModalEditTask.bind(this);
		this.saveEngineInfo = this.saveEngineInfo.bind(this);
		this.refreshEngineInfo = this.refreshEngineInfo.bind(this);
		this.refreshTaskList = this.refreshTaskList.bind(this);
		this.createOrSaveTask = this.createOrSaveTask.bind(this);
		this.changeCurrentTask = this.changeCurrentTask.bind(this);
		this.deleteTask = this.deleteTask.bind(this);

		axiosRetry(axios, { retries: 60, retryDelay: () => 1000 });
	}
	
	toggleModalEngineInfo() {
    	this.setState(
			function (prevState, props){
				return { modalEngineInfo: !prevState.modalEngineInfo }
			});
  	}
	
	toggleModalEditTask(isCreationMode) {
    	this.setState(
			function (prevState, props){
				return { 
					modalEditTask: !prevState.modalEditTask,
					editedTask: isCreationMode?undefined:this.state.currentTask
				}
			});
  	}
	
	saveEngineInfo(engineInfo){
		axios.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo", engineInfo)
		.then(response => {
			this.toggleModalEngineInfo();
			this.setState(
				function (prevState, props){
					return { 
						brand: engineInfo.brand,
						model: engineInfo.model,
						age: engineInfo.age,
						installation: new Date(engineInfo.installation)
					}
				});
		})
		.catch(error => {
			console.log( error );
		});
	}
	
	createOrSaveTask(task){
		axios
		.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks", task)
		.then(response => {
			this.toggleModalEditTask();
			this.refreshTaskList(() =>{
				var newCurrentTaskIndex = 0;
				while(newCurrentTaskIndex < this.state.tasks.length && this.state.tasks[newCurrentTaskIndex].id !== response.data.id)newCurrentTaskIndex++;

				if(newCurrentTaskIndex < this.state.tasks.length){
					this.changeCurrentTask(this.state.tasks[newCurrentTaskIndex]);
				}
			});
		})
		.catch(error => {
			console.log( error );
		});
	}

	deleteTask(){
		var taskIndex = 0;
		var nextTaskIndex = 0
		while(taskIndex < this.state.tasks.length && this.state.tasks[taskIndex].id !== this.state.editedTask.id)taskIndex++;
		if(taskIndex === this.state.tasks.length - 1)
			nextTaskIndex = taskIndex - 1;
		else
			nextTaskIndex = taskIndex;

		axios
		.delete(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + this.state.editedTask.id)
		.then(response => {
			this.toggleModalEditTask();
			this.refreshTaskList(()=>{
				if(nextTaskIndex !== -1){
					this.changeCurrentTask(this.state.tasks[nextTaskIndex]);
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
			this.setState(function(prevState, props){ return newState; });
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
			this.setState(newState);
		});
	}

	changeCurrentTask(task){
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + task.id + "/historic")
      	.then(response => {	
			// create a new "State" object without mutating 
			// the original State object.
			const newState = Object.assign({}, this.state, {
				currentHistoryTask: response.data,
				currentTask: task,
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				currentHistoryTask: [],
				currentTask: task,
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
		});
	}
	
	refreshTaskList(complete){
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks")
      	.then(response => {	
			if (this.state.currentTask === undefined && response.data.length > 0){
				this.changeCurrentTask(response.data[0]);
			}

			// create a new "State" object without mutating 
			// the original State object.
			const newState = Object.assign({}, this.state, {
				tasks: response.data,
			});

			// store the new state object in the component's state
			this.setState(
				function(prevState, props){ return newState; },
				() =>{
					if(complete !== undefined && typeof complete === "function"){
						complete();
				}
			});
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				tasks: [],
			});

			// store the new state object in the component's state
			this.setState(newState);
		});
	}

	componentDidMount() {
		this.refreshEngineInfo();
		this.refreshTaskList();
	}
    
	render() {
		return (
			<div>
				<div id="root" className="d-flex flex-wrap flex-row mb-3">
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<EngineInfo brand={this.state.brand} model={this.state.model} age={this.state.age} installation={this.state.installation} toggleModal={this.toggleModalEngineInfo}/>
						<TaskTable tasks={this.state.tasks} toggleModal={() => this.toggleModalEditTask(true)} changeCurrentTask={this.changeCurrentTask}/>
					</div>
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<CarouselTaskDetails tasks={this.state.tasks} currentTask={this.state.currentTask} changeCurrentTask={this.changeCurrentTask} toggleModal={() => this.toggleModalEditTask(false)}/>
						<HistoryTaskTable taskHistory={this.state.currentHistoryTask}/>
					</div>
				</div>
				
				<ModalEngineInfo visible={this.state.modalEngineInfo} 
					toggle={this.toggleModalEngineInfo} 
					save={this.saveEngineInfo} 
					brand={this.state.brand} model={this.state.model} age={this.state.age} installation={this.state.installation}
				/>
				<ModalEditTask visible={this.state.modalEditTask} 
					toggle={this.toggleModalEditTask} 
					save={this.createOrSaveTask} 
					delete={this.deleteTask}
					task={this.state.editedTask}
				/>
			</div>
		);
	}
}

export default App;
