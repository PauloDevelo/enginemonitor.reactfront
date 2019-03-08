import axios from "axios";
import axiosRetry from 'axios-retry';
import HttpError from '../http/HttpError'
import { updateEquipment } from '../helpers/EquipmentHelper'
import { updateTask } from '../helpers/TaskHelper'
import { updateEntry } from '../helpers/EntryHelper'

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

    /////////////////////User/////////////////////////
    signup = async (newUser) => {
        const {user} = await this.post(this.baseUrl + "users/", { user: newUser });
        return user;
    }

    authenticate = async (credentials) => {
        try{
            const data = await this.post(this.baseUrl + "users/login", { user: credentials });
            
            if(data.user){
                this.config = { headers: { Authorization: 'Token ' + data.user.token }};
                if(credentials.remember){
                    sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify(this.config));
                }

                return data.user;
            }
            
            throw new HttpError( { loginerror: "loginfailed"} )
        }
        catch(error){
            console.log('Authentication failed.');
            console.log( error );
            throw error;
        }
    }

    logout = () => {
        sessionStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    fetchCurrentUser = async() => {
        if(this.config){
            const {user} = await this.get(this.baseUrl + "users/current");
            return user;
        }
        else{
            return undefined;
        }
    }

    ////////////////Equipment////////////////////////
    fetchEquipments = async() => {
        const {equipments} = await this.get(this.baseUrl + "equipments");
        equipments.forEach((equipment) => updateEquipment(equipment));
        return equipments;
    }
    
    createOrSaveEquipment = async(equipmentToSave) => {
        if(equipmentToSave._id){
            const {equipment} = await this.post(this.baseUrl + "equipments/" + equipmentToSave._id, { equipment: equipmentToSave });
            return updateEquipment(equipment);
        }
        else{
            const {equipment} = await this.post(this.baseUrl + "equipments", { equipment: equipmentToSave });
            return updateEquipment(equipment);
        }
    }

    fetchEquipmentInfo = async (idEquipment) =>{
        const {equipment} = await this.get(this.baseUrl + "equipments/" + idEquipment);
        return updateEquipment(equipment);
    }

    deleteEquipment = async (idEquipment) => {
        const {equipment} = await this.delete(this.baseUrl + "equipments/" + idEquipment);
        return updateEquipment(equipment);
    }

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId, newTask) =>{
        if(newTask._id === undefined){
            const {task} = await this.post(this.baseUrl + "tasks/" + equipmentId, { task: newTask });
            return updateTask(task);
        }
        else{
            const {task} = await this.post(this.baseUrl + "tasks/" + equipmentId + '/' + newTask._id, { task: newTask });
            return updateTask(task);
        }
    }

    deleteTask = async(equipmentId, taskId) => {
        const {task} = await this.delete(this.baseUrl + "tasks/" + equipmentId + '/' + taskId);
        return updateTask(task);
    }

    fetchTasks = async(equipmentId, complete, fail) => {
        const { tasks } = await this.get(this.baseUrl + "tasks/" + equipmentId);
        tasks.forEach(task => updateTask(task));
        return tasks;
    }

    ///////////////////////////Entry////////////////////////

    createOrSaveEntry = async (equipmentId, taskId, newEntry) => {
        if(newEntry._id === undefined){
            const {entry} = await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskId, { entry: newEntry });
            return updateEntry(entry)
        }
        else{
            const {entry} = await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + newEntry._id, { entry: newEntry });
            return updateEntry(entry)
        }
    }

    deleteEntry = async(equipmentId, taskid, entryId) => {
        const {entry} = await this.delete(this.baseUrl + "entries/" + equipmentId + '/' + taskid + '/' + entryId);
        return updateEntry(entry)
    }

    fetchEntries = async(equipmentId, taskId) => {
        if (equipmentId === undefined || taskId === undefined)
            return [];

        const {entries} = await this.get(this.baseUrl + "entries/" + equipmentId + '/' + taskId);
        entries.forEach(entry => updateEntry(entry) );
        return entries;
    }

    async post(url, data){
        try{
            const response = await axios.post(url, data, this.config);
            if(response.errors){
                console.log(response.errors);
            }

		    return response.data;
        }
        catch(error){
            console.log( error );
            throw new HttpError(error.response ? error.response.data.errors : undefined);
        }
    }
    
    async delete(url){
        try{
            const response = await axios.delete(url, this.config);
		    return response.data;
        }
        catch(error){
            console.log( error );
            throw new HttpError(error.response ? error.response.data.errors : undefined);
        }
    }

    async get(url){
        try{
            const response = await axios.get(url, this.config);
		    return response.data;
        }
        catch(error){
            console.log( error );
            throw new HttpError(error.response ? error.response.data.errors : undefined);
        }
    }
}

const EquipmentMonitorService = new EquipmentMonitorServiceProxy();

export default EquipmentMonitorService;