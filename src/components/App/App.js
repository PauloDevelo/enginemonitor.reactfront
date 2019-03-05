import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group'
  
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import TaskTable from '../TaskTable/TaskTable';
import ModalEditTask from '../ModalEditTask/ModalEditTask';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';
import { createDefaultTask, getCurrentTask } from '../../helpers/TaskHelper'

import '../../style/transition.css';

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			user: {},

			modalEditTask: false,
			modalSignup: false,
			navBar: true,

			currentEquipment: undefined,
			tasks:[],
			currentTaskIndex: -1,
			editedTask: createDefaultTask(),
		};
	}

	setStateAsync = updater => new Promise(resolve => this.setState(updater, resolve))

	login = async (credentials) => {
		const user = await EquipmentMonitorService.authenticate(credentials);
		await this.setStateAsync((prevState, props) => { return { user: user } });
	}

	logout = async () => {
		EquipmentMonitorService.logout();
		await this.setStateAsync( (prevState, props) => { return { user: undefined } });
		this.refreshTaskList();
	}

	toggleNavBar = () => this.setState((prevState, props) => {return { navBar: !prevState.navBar }});

	toggleModalSignup = () => this.setState((prevState, props) => {return { modalSignup: !prevState.modalSignup }});
	
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
			const user = await EquipmentMonitorService.fetchCurrentUser();
			this.setState({ user:user });
		}
		catch(error){
			this.setState({ user: undefined })
		}
	}

	changeCurrentEquipment = async (newEquipment) => {
		await this.setStateAsync({ currentEquipment:newEquipment });
		await this.refreshTaskList();

		if(this.state.tasks.length > 0){
			this.changeCurrentTaskIndex(0);
		}
	}

	createOrSaveTask = async (taskToSave) => {
		if(this.state.currentEquipment === undefined){
			throw Error("noEquipmentSelected");
		}

		const savedTask = await EquipmentMonitorService.createOrSaveTask(this.state.currentEquipment._id, taskToSave);
		await this.refreshTaskList();
		this.changeCurrentTask(savedTask);
	}

	deleteTask = async() => {
		var nextTaskIndex = (this.state.currentTaskIndex === this.state.tasks.length - 1) ? this.state.currentTaskIndex - 1:this.state.currentTaskIndex
		
		await EquipmentMonitorService.deleteTask(this.state.currentEquipment, this.state.editedTask._id);
		await this.refreshTaskList();
		await this.changeCurrentTaskIndex(nextTaskIndex);
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
			await this.setStateAsync({ currentTaskIndex: -1 });
			return;
		}

		try{
			await this.setStateAsync({ currentTaskIndex: newTaskIndex });
		}
		catch(error){
			await this.setStateAsync({ currentTaskIndex: newTaskIndex });
			throw error;
		}
	}
	
	refreshTaskList = async() => {
		if(this.state.currentEquipment !== undefined){
			try{
				const tasks = await EquipmentMonitorService.fetchTasks(this.state.currentEquipment._id);

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
		await this.setStateAsync({ tasks: [], currentTaskIndex: -1 });
	}		

	async componentDidMount() {
		await this.refreshCurrentUser();
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
							<EquipmentsInfo
										user={this.state.user}
										changeCurrentEquipment={this.changeCurrentEquipment}
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
												classNames={panelClassNames}/>
							<HistoryTaskTable 	equipment={this.state.currentEquipment}
												task={getCurrentTask(this.state)}
												onHistoryChanged={() => this.refreshTaskList()}
												classNames={panelClassNames}/>
						</div>
					</div>
					
					<ModalEditTask visible={this.state.modalEditTask} 
						toggle={this.toggleModalEditTask} 
						saveTask={this.createOrSaveTask} 
						deleteTask={this.deleteTask}
						task={this.state.editedTask}
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