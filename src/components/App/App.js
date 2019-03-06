import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group'
  
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import TaskTable from '../TaskTable/TaskTable';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable'
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails'
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import '../../style/transition.css';

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			user: {},

			modalSignup: false,
			navBar: true,

			currentEquipment: undefined,
			tasks:[],
			currentTask: undefined
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
	}

	onCurrentTaskChanged = (task)=>{
		this.refreshTaskList();
	}

	changeCurrentTask = (currentTask) => {
		this.setState({ currentTask: currentTask });
	}
	
	refreshTaskList = async() => {
		if(this.state.currentEquipment !== undefined){
			try{
				const tasks = await EquipmentMonitorService.fetchTasks(this.state.currentEquipment._id);

				// store the new state object in the component's state
				await this.setStateAsync((prevState, props) => {
					let newCurrentTask = undefined;
					if(prevState.currentTask !== undefined){
						newCurrentTask = tasks.find(task => task._id === prevState.currentTask._id);
					}

					return {
						tasks: tasks,
						currentTask: newCurrentTask
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
		await this.setStateAsync({ tasks: [], currentTask: undefined });
	}		

	async componentDidMount() {
		await this.refreshCurrentUser();
	}
    
	render() {
		var panelClassNames = "p-2 m-2 border border-secondary rounded shadow";
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
							<TaskTable 	equipment={this.state.currentEquipment}
										tasks={this.state.tasks} 
										onTaskSaved={this.onCurrentTaskChanged}
										changeCurrentTask={this.changeCurrentTask}
										classNames={panelClassNames}/>
						</div>
						<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
							<CardTaskDetails 	equipment={this.state.currentEquipment}
												tasks={this.state.tasks}
												currentTask={this.state.currentTask}
												onTaskChanged={this.onCurrentTaskChanged}
												onTaskDeleted={this.onCurrentTaskChanged}
												changeCurrentTask={this.changeCurrentTask}
												classNames={panelClassNames}/>
							<HistoryTaskTable 	equipment={this.state.currentEquipment}
												task={this.state.currentTask}
												onHistoryChanged={() => this.refreshTaskList()}
												classNames={panelClassNames}/>
						</div>
					</div>
					
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