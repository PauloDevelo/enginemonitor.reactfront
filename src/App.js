
import React, { Component } from 'react';

import EngineInfo from './EngineInfo';
import ModalEngineInfo from './ModalEngineInfo';
import TaskTable from './TaskTable';
import ModalCreateTask from './ModalCreateTask';

import axios from "axios";

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
			modalCreateTask: false,

			brand: undefined,
			model: undefined,
			age: undefined,
			installation: Date.now(),
			
			tasks:undefined
		};

		this.toggleModalEngineInfo = this.toggleModalEngineInfo.bind(this);
		this.toggleModalCreateTask = this.toggleModalCreateTask.bind(this);
		this.saveEngineInfo = this.saveEngineInfo.bind(this);
		this.getEngineInfo = this.getEngineInfo.bind(this);
		this.getTaskList = this.getTaskList.bind(this);
		this.createNewTask = this.createNewTask.bind(this);
	}
	
	toggleModalEngineInfo() {
    this.setState(
			function (prevState, props){
				return { modalEngineInfo: !prevState.modalEngineInfo }
			});
  	}
	
	toggleModalCreateTask() {
    this.setState(
			function (prevState, props){
				return { modalCreateTask: !prevState.modalCreateTask }
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
	
	createNewTask(task){
		axios
		.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks", task)
		.then(response => {
			this.toggleModalCreateTask();
			this.getTaskList();
		})
		.catch(error => {
			console.log( error );
		});
	}
	
	getEngineInfo(){
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
	
	getTaskList(){
		axios
      	.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks")
      	.then(response => {			
        	// create a new "State" object without mutating 
			// the original State object. 
			const newState = Object.assign({}, this.state, {
				tasks: response.data,
			});

			// store the new state object in the component's state
			this.setState(function(prevState, props){ return newState; });
      	})
      	.catch(error => {
			console.log( error );
		
			const newState = Object.assign({}, this.state, {
				tasks: undefined,
			});

			// store the new state object in the component's state
			this.setState(newState);
		});
	}

	componentDidMount() {
		this.getEngineInfo();
		this.getTaskList();
	}
    
	render() {
		return (
			<div>
				<div id="root" className="d-flex flex-wrap flex-row mb-3">
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<EngineInfo brand={this.state.brand} model={this.state.model} age={this.state.age} installation={this.state.installation} toggleModal={this.toggleModalEngineInfo}/>
						<TaskTable tasks={this.state.tasks} toggleModal={this.toggleModalCreateTask}/>
					</div>
					<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
						<div id="carrouselTaskDetails" className="p-2 m-2 border border-primary rounded shadow"></div>
						<div id="taskHistoric" className="p-2 m-2 border border-primary rounded shadow"></div>
					</div>
				</div>
				
				<ModalEngineInfo visible={this.state.modalEngineInfo} 
					toggle={this.toggleModalEngineInfo} 
					save={this.saveEngineInfo} 
					brand={this.state.brand} model={this.state.model} age={this.state.age} installation={this.state.installation}
				/>
				<ModalCreateTask visible={this.state.modalCreateTask} 
					toggle={this.toggleModalCreateTask} 
					save={this.createNewTask} 
				/>
			</div>
		);
	}
}

export default App;
