import axios from "axios";
import axiosRetry from 'axios-retry';

class EngineMonitorServiceProxy{
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
            this.config = JSON.parse(sessionStorage.getItem('EngineMonitorServiceProxy.config'));
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
                    sessionStorage.setItem('EngineMonitorServiceProxy.config', JSON.stringify(this.config));
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
        sessionStorage.setItem('EngineMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    refreshCurrentUser = (complete, fail) => this.get(this.baseUrl + "users/current", complete, fail);

    getBoats = (complete, fail) => this.get(this.baseUrl + "boats", complete, fail);
    
    saveBoat = (boat, complete, fail) => {
        if(boat._id){
            this.post(this.baseUrl + "boats/" + boat._id, { boat: boat }, complete, fail);
        }
        else{
            this.post(this.baseUrl + "boats", { boat: boat }, complete, fail);
        }
    }

    refreshEngineInfo = (idBoat, complete, fail) => this.get(this.baseUrl + "boats/" + idBoat, complete, fail);

    createTask = (boatId, task, complete, fail) => this.post(this.baseUrl + "tasks/" + boatId, { task: task }, complete, fail);
    saveTask = (boatId, task, complete, fail) => this.post(this.baseUrl + "tasks/" + boatId + '/' + task._id, { task: task }, complete, fail);

    deleteTask = (boatId, taskid, complete, fail) => this.delete(this.baseUrl + "tasks/" + boatId + '/' + taskid, complete, fail);
    refreshHistoryTask = (boatId, taskid, complete, fail) => this.get(this.baseUrl + "entries/" + boatId + '/' + taskid, complete, fail);
    refreshTaskList = (boatId, complete, fail) => this.get(this.baseUrl + "tasks/" + boatId, complete, fail);
    
    createEntry = (boatId, taskid, entry, complete, fail) => {
        this.post(this.baseUrl + "entries/" + boatId + '/' + taskid, { entry: entry }, complete, fail);
    }

    saveEntry = (boatId, taskid, entry, complete, fail) => {
        this.post(this.baseUrl + "entries/" + boatId + '/' + taskid + '/' + entry._id, { entry: entry }, complete, fail);
    }

    deleteEntry = (boatId, taskid, entryId, complete, fail) => this.delete(this.baseUrl + "entries/" + boatId + '/' + taskid + '/' + entryId, complete, fail);

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

export default EngineMonitorServiceProxy;