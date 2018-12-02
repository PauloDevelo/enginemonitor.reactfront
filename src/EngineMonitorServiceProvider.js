import axios from "axios";
import axiosRetry from 'axios-retry';

import {formatDateInUTC} from './Helpers' 

var mode = 'dev'; //prod or demo
var baseUrl = "http://localhost:8081";
if(mode === 'prod'){
	baseUrl = "http://arbutuspi:8080";
}
else if(mode === 'demo'){
	baseUrl = "http://192.168.0.50:8080";
}

class EngineMonitorServiceProvider{
    constructor(){
        axiosRetry(axios, { retries: 60, retryDelay: () => 1000 });
    }

    saveEngineInfo = (engineInfo, complete, fail) => {
        engineInfo.installation = formatDateInUTC(engineInfo.installation);
        this.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo", engineInfo, complete, fail);
    }
    refreshEngineInfo = (complete, fail) => this.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo", complete, fail);

    createOrSaveTask = (task, complete, fail) => this.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks", task, complete, fail);
    deleteTask = (taskid, complete, fail) => this.delete(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + taskid, complete, fail);
    refreshHistoryTask = (taskid, complete, fail) => this.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + taskid + "/historic", complete, fail);
    refreshTaskList = (complete, fail) => this.get(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks", complete, fail);
    
    createOrSaveEntry = (taskid, entry, complete, fail) => {
        entry.UTCDate = formatDateInUTC(entry.UTCDate);
        this.post(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + taskid + "/historic", entry, complete, fail);
    }
    deleteEntry = (taskid, entryId, complete, fail) => this.delete(baseUrl + "/engine-monitor/webapi/enginemaintenance/tasks/" + taskid + "/historic/" + entryId, complete, fail);

    post(url, data, complete, fail){
        axios.post(url, data)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }
    
    delete(url, complete, fail){
        axios.delete(url)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})	
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }

    get(url, complete, fail){
        axios.get(url)
		.then(response => {
			if(typeof complete === 'function') complete(response.data);
		})	
		.catch(error => {
            console.log( error );
            if(typeof fail === 'function') fail();
		});
    }
}

export default EngineMonitorServiceProvider;