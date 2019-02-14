import axios from "axios";
import axiosRetry from 'axios-retry';
import HttpError from '../http/HttpError'

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

    signup = async (newUser) => {
        try{
            const res = await axios.post(this.baseUrl + "users/", { user: newUser });
            if(res.errors){
                console.log(res.errors);
            }

            return res.data;
        }
        catch(error){
            console.log('Signup failed.');
            console.log( error );
            throw new HttpError(error.response ? error.response.data.errors : undefined);
        }
    }

    authenticate = async (credentials) => {
        try{
            const res = await axios.post(this.baseUrl + "users/login", { user: credentials });
            if(res.errors){
                console.log(res.errors);
            }

            if(res.data.user){
                this.config = { headers: { Authorization: 'Token ' + res.data.user.token }};
                if(credentials.remember){
                    sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify(this.config));
                }

                return res.data.user;
            }
            
            throw new HttpError( { loginerror: "loginfailed"} )
        }
        catch(error){
            console.log('Authentication failed.');
            console.log( error );
            throw new HttpError(error.response ? error.response.data.errors : undefined);
        }
    }

    logout = () => {
        sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    refreshCurrentUser = async() => {
        return await this.get(this.baseUrl + "users/current");
    }

    getEquipments = async() => {
        return await this.get(this.baseUrl + "equipments");
    }
    
    saveEquipment = async(equipment) => {
        if(equipment._id){
            return await this.post(this.baseUrl + "equipments/" + equipment._id, { equipment: equipment });
        }
        else{
            return await this.post(this.baseUrl + "equipments", { equipment: equipment });
        }
    }

    refreshEquipmentInfo = async (idEquipment) =>{
        return await this.get(this.baseUrl + "equipments/" + idEquipment);
    } 

    createTask = async (equipmentId, task) =>{
        return await this.post(this.baseUrl + "tasks/" + equipmentId, { task: task });
    }

    saveTask = async (equipmentId, task) => {
        return await this.post(this.baseUrl + "tasks/" + equipmentId + '/' + task._id, { task: task });
    }

    deleteTask = async(equipmentId, taskid) => {
        return await this.delete(this.baseUrl + "tasks/" + equipmentId + '/' + taskid);
    }

    refreshHistoryTask = async(equipmentId, taskid) => {
        return await this.get(this.baseUrl + "entries/" + equipmentId + '/' + taskid);
    }

    refreshTaskList = async(equipmentId, complete, fail) => {
        return await this.get(this.baseUrl + "tasks/" + equipmentId);
    }
    
    createEntry = async (equipmentId, taskid, entry) => {
        return await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskid, { entry: entry });
    }

    saveEntry = async(equipmentId, taskid, entry) => {
        return await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskid + '/' + entry._id, { entry: entry });
    }

    deleteEntry = async(equipmentId, taskid, entryId) => {
        return await this.delete(this.baseUrl + "entries/" + equipmentId + '/' + taskid + '/' + entryId);
    }

    async post(url, data){
        try{
            const response = await axios.post(url, data, this.config);
		    return response.data;
        }
        catch(error){
            console.log( error );
            throw error;
        }
    }
    
    async delete(url){
        try{
            const response = await axios.delete(url, this.config);
		    return response.data;
        }
        catch(error){
            console.log( error );
            throw error;
        }
    }

    async get(url){
        try{
            const response = await axios.get(url, this.config);
		    return response.data;
        }
        catch(error){
            console.log( error );
            throw error;
        }
    }
}

const EquipmentMonitorService = new EquipmentMonitorServiceProxy();

export default EquipmentMonitorService;