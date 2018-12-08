import axios from "axios";
import axiosRetry from 'axios-retry';

import {formatDateInUTC} from './Helpers' 

class EngineMonitorServiceProxy{
    config = undefined;

    mode = 'dev'; //prod or demo
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
            if(typeof fail === 'function') fail(error.response.data);
        });
    }

    logout = () => {
        sessionStorage.setItem('EngineMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    refreshCurrentUser = (complete, fail) => this.get(this.baseUrl + "users/current", complete, fail);

    saveEngineInfo = (engineInfo, complete, fail) => {
        engineInfo.installation = formatDateInUTC(engineInfo.installation);
        this.post(this.baseUrl + "enginemaintenance/engineinfo", engineInfo, complete, fail);
    }
    refreshEngineInfo = (complete, fail) => this.get(this.baseUrl + "enginemaintenance/engineinfo", complete, fail);

    createOrSaveTask = (task, complete, fail) => this.post(this.baseUrl + "enginemaintenance/tasks", task, complete, fail);
    deleteTask = (taskid, complete, fail) => this.delete(this.baseUrl + "enginemaintenance/tasks/" + taskid, complete, fail);
    refreshHistoryTask = (taskid, complete, fail) => this.get(this.baseUrl + "enginemaintenance/tasks/" + taskid + "/historic", complete, fail);
    refreshTaskList = (complete, fail) => this.get(this.baseUrl + "enginemaintenance/tasks", complete, fail);
    
    createOrSaveEntry = (taskid, entry, complete, fail) => {
        entry.UTCDate = formatDateInUTC(entry.UTCDate);
        this.post(this.baseUrl + "enginemaintenance/tasks/" + taskid + "/historic", entry, complete, fail);
    }
    deleteEntry = (taskid, entryId, complete, fail) => this.delete(this.baseUrl + "enginemaintenance/tasks/" + taskid + "/historic/" + entryId, complete, fail);

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