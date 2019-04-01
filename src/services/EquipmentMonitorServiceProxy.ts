import axios from "axios";
import axiosRetry from 'axios-retry';
import HttpError from '../http/HttpError'
import { updateEquipment } from '../helpers/EquipmentHelper'
import { updateTask } from '../helpers/TaskHelper'
import { updateEntry } from '../helpers/EntryHelper'
import {User, Equipment, Task, Entry, AuthInfo} from '../types/Types'

type Config = {
    headers: {
        Authorization: string
    }
};

class EquipmentMonitorServiceProxy{
    private config:Config | undefined;

    baseUrl = process.env.REACT_APP_URL_BASE;

    constructor(){
        axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });

        const config = localStorage.getItem('EquipmentMonitorServiceProxy.config');
        if(config != null){
            this.config = JSON.parse(config);
        }
        else{
            this.config = undefined;
        }
    }

    /////////////////////User/////////////////////////
    signup = async (newUser: User): Promise<void> => {
        await this.post(this.baseUrl + "users/", { user: newUser });
    }

    sendVerificationEmail = async(email: string): Promise<void> => {
        await this.post(this.baseUrl + "users/verificationemail", { email: email });
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
        await this.post(this.baseUrl + "users/resetpassword", { email: email, newPassword: password });
    }

    authenticate = async (authInfo: AuthInfo):Promise<User> => {
        this.logout();

        const data = await this.post(this.baseUrl + "users/login", { user: authInfo });
        
        if(data.user){
            this.config = { headers: { Authorization: 'Token ' + data.user.token }};
            if(authInfo.remember){
                localStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify(this.config));
            }

            return data.user as User;
        }
        
        throw new HttpError( { loginerror: "loginfailed"} );
    }

    logout = (): void => {
        localStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify({}));
        this.config = undefined;
    }

    fetchCurrentUser = async():Promise<User | undefined> => {
        if(this.config){
            const {user} = await this.get(this.baseUrl + "users/current");
            return user;
        }
        else{
            return undefined;
        }
    }

    ////////////////Equipment////////////////////////
    fetchEquipments = async(): Promise<Equipment[]> => {
        const {equipments} = await this.get(this.baseUrl + "equipments");
        return (equipments as Equipment[]).map(updateEquipment);
    }
    
    createOrSaveEquipment = async(equipmentToSave: Equipment):Promise<Equipment> => {
        if(equipmentToSave._id){
            const { equipment } = await this.post(this.baseUrl + "equipments/" + equipmentToSave._id, { equipment: equipmentToSave });
            return updateEquipment(equipment);
        }
        else{
            const { equipment } = await this.post(this.baseUrl + "equipments", { equipment: equipmentToSave });
            return updateEquipment(equipment);
        }
    }

    importEquipmentInfo = async (idEquipment: string, serverIpAddress: string) =>{
        const {equipment} = await this.get(this.baseUrl + "equipments/" + idEquipment + '/import/' + serverIpAddress);
        return updateEquipment(equipment);
    }

    deleteEquipment = async (idEquipment: string) => {
        const {equipment} = await this.delete(this.baseUrl + "equipments/" + idEquipment);
        return updateEquipment(equipment);
    }

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: Task) =>{
        if(newTask._id === undefined){
            const {task} = await this.post(this.baseUrl + "tasks/" + equipmentId, { task: newTask });
            return updateTask(task);
        }
        else{
            const {task} = await this.post(this.baseUrl + "tasks/" + equipmentId + '/' + newTask._id, { task: newTask });
            return updateTask(task);
        }
    }

    deleteTask = async(equipmentId: string, taskId: string) => {
        const {task} = await this.delete(this.baseUrl + "tasks/" + equipmentId + '/' + taskId);
        return updateTask(task);
    }

    fetchTasks = async(equipmentId: string): Promise<Task[]> => {
        const { tasks } = await this.get(this.baseUrl + "tasks/" + equipmentId);
        return (tasks as Task[]).map(updateTask);
    }

    ///////////////////////////Entry////////////////////////

    createOrSaveEntry = async (equipmentId: string, taskId: string, newEntry: Entry) => {
        if(newEntry._id === undefined){
            const {entry} = await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskId, { entry: newEntry });
            return updateEntry(entry)
        }
        else{
            const {entry} = await this.post(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + newEntry._id, { entry: newEntry });
            return updateEntry(entry)
        }
    }

    deleteEntry = async(equipmentId: string, taskId: string, entryId: string): Promise<Entry> => {
        const {entry} = await this.delete(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + entryId);
        return updateEntry(entry)
    }

    fetchEntries = async(equipmentId: string, taskId: string) => {
        if (equipmentId === undefined || taskId === undefined)
            return [];

        const {entries} = await this.get(this.baseUrl + "entries/" + equipmentId + '/' + taskId);
        return (entries as Entry[]).map(updateEntry);
    }

    async post(url: string, data: any){
        try{
            const response = await axios.post(url, data, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error)
        }
    }
    
    async delete(url: string){
        try{
            const response = await axios.delete(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error)
        }
    }

    async get(url: string){
        try{
            const response = await axios.get(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }

    processError(error: any){
        if(error){
            console.log( error );

            let data:any = { message: error.message};
            if(error.response){
                if(error.response.data){
                    if(error.response.data.errors){
                        data = error.response.data.errors;
                    }
                    else{
                        data = error.response.data;
                    }
                }
            }
            
            throw new HttpError(data);
        }
    }
}

const EquipmentMonitorService = new EquipmentMonitorServiceProxy();

export default EquipmentMonitorService;