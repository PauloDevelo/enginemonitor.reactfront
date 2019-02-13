import axios from "axios";
import axiosRetry from 'axios-retry';

class EquipmentMonitorServiceProxy{
    config = undefined;

    mode = 'auth'; //prod or demo
    baseUrl = "http://localhost:8081/engine-monitor/webapi/";

    constructor(){
        axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });

        if(this.mode === 'prod'){
            this.baseUrl = "http://arbutuspi:8080/engine-monitor/webapi/";
        }
        else if(this.mode === 'demo'){
            this.baseUrl = "http://192.168.0.50:8080/engine-monitor/webapi/";
        }
        else if(this.mode === 'auth'){
            this.baseUrl = "http://localhost:8000/api/";
        }

        try{
            this.config = JSON.parse(sessionStorage.getItem('EquipmentMonitorServiceProxy.config'));
        }
        catch{}
    }

    signup = (newuser, complete, fail) => {
        var data = {
            user: newuser
        }
        axios.post(this.baseUrl + "users/", data)
		.then(res => {
			if(res.errors){
                console.log(res.errors);
            }
            if(typeof complete === 'function') complete(res.data);
		})
		.catch(error => {
            console.log('Signup failed.');
            console.log( error );
            if(typeof fail === 'function') fail(error.response ? error.response.data: undefined);
        });

    }

    authenticate = (credentials, complete, fail) => {
        var data = {
            user: credentials
        }
        axios.post(this.baseUrl + "users/login", data)
		.then(res => {
			if(res.errors){
                console.log(res.errors);
            }

            if(res.data.user){
                this.config = { headers: { Authorization: 'Token ' + res.data.user.token }};
                if(credentials.remember){
                    sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify(this.config));
                }

                if(typeof complete === 'function') complete(res.data.user);
            }
		})
		.catch(error => {
            console.log('Authentication failed.');
            console.log( error );
            if(typeof fail === 'function') fail(error.response ? error.response.data: { errors:undefined});
        });
    }

    logout = () => {
        sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    refreshCurrentUser = (complete, fail) => this.get(this.baseUrl + "users/current", complete, fail);

    getEquipments = (complete, fail) => this.get(this.baseUrl + "equipments", complete, fail);
    
    saveEquipment = (equipment, complete, fail) => {
        if(equipment._id){
            this.post(this.baseUrl + "equipments/" + equipment._id, { equipment: equipment }, complete, fail);
        }
        else{
            this.post(this.baseUrl + "equipments", { equipment: equipment }, complete, fail);
        }
    }

    refreshEquipmentInfo = (idEquipment, complete, fail) => this.get(this.baseUrl + "equipments/" + idEquipment, complete, fail);

    createTask = (equipmentId, task, complete, fail) => this.post(this.baseUrl + "tasks/" + equipmentId, { task: task }, complete, fail);
    saveTask = (equipmentId, task, complete, fail) => this.post(this.baseUrl + "tasks/" + equipmentId + '/' + task._id, { task: task }, complete, fail);

    deleteTask = (equipmentId, taskid, complete, fail) => this.delete(this.baseUrl + "tasks/" + equipmentId + '/' + taskid, complete, fail);
    refreshHistoryTask = (equipmentId, taskid, complete, fail) => this.get(this.baseUrl + "entries/" + equipmentId + '/' + taskid, complete, fail);
    refreshTaskList = (equipmentId, complete, fail) => this.get(this.baseUrl + "tasks/" + equipmentId, complete, fail);
    
    createEntry = (equipmentId, taskid, entry, complete, fail) => {
        this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskid, { entry: entry }, complete, fail);
    }

    saveEntry = (equipmentId, taskid, entry, complete, fail) => {
        this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskid + '/' + entry._id, { entry: entry }, complete, fail);
    }

    deleteEntry = (equipmentId, taskid, entryId, complete, fail) => this.delete(this.baseUrl + "entries/" + equipmentId + '/' + taskid + '/' + entryId, complete, fail);

    post(url, data, complete, fail){
        axios.post(url, data, this.config)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }
    
    delete(url, complete, fail){
        axios.delete(url, this.config)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})	
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }

    get(url, complete, fail){
        axios.get(url, this.config)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})	
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }
}

export default EquipmentMonitorServiceProxy;