import axios from "axios";
import axiosRetry from 'axios-retry';
import localforage from 'localforage';

import HttpError from '../http/HttpError'

import { updateEquipment } from '../helpers/EquipmentHelper'
import { updateTask } from '../helpers/TaskHelper'
import { updateEntry } from '../helpers/EntryHelper'
import {UserModel, EquipmentModel, TaskModel, EntryModel, AuthInfo, EntityModel} from '../types/Types'

type Config = {
    headers: {
        Authorization: string
    }
};

enum ActionType{
    Post,
    Delete
}

interface Action{
    type: ActionType,
    url:string,
    data?:any
};

export class EquipmentMonitorServiceProxy{
    private config:Config | undefined;
    private userStorage: LocalForage | undefined;

    baseUrl = process.env.REACT_APP_URL_BASE;

    constructor(){
        axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });

        localforage.config({
            driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
            name        : 'maintenance reminder',
            version     : 1.0,
            size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
            storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
            description : 'Contains all the information contained in Maintenance monitor'
        });
    }

    /////////////////////User/////////////////////////
    signup = async (newUser: UserModel): Promise<void> => {
        await this.post(this.baseUrl + "users/", { user: newUser });
    }

    sendVerificationEmail = async(email: string): Promise<void> => {
        await this.post(this.baseUrl + "users/verificationemail", { email: email });
    }

    resetPassword = async (email: string, password: string): Promise<void> => {
        await this.post(this.baseUrl + "users/resetpassword", { email: email, newPassword: password });
    }

    authenticate = async (authInfo: AuthInfo):Promise<UserModel> => {
        this.logout();

        const data = await this.post(this.baseUrl + "users/login", { user: authInfo });
        
        if(data.user){
            const user = data.user as UserModel;
            this.config = { headers: { Authorization: 'Token ' + data.user.token }};

            if(authInfo.remember){
                localforage.setItem('EquipmentMonitorServiceProxy.config', this.config);
                localforage.setItem<UserModel>('currentUser', user);
            }

            this.userStorage = localforage.createInstance({
                name: user.email
            });

            return user;
        }
        
        throw new HttpError( { loginerror: "loginfailed"} );
    }

    logout = async (): Promise<void> => {
        localforage.removeItem('EquipmentMonitorServiceProxy.config');
        localforage.removeItem('currentUser');
        this.config = undefined;
        this.userStorage = undefined;
    }

    fetchCurrentUser = async():Promise<UserModel | undefined> => {
        this.config = await localforage.getItem<Config>('EquipmentMonitorServiceProxy.config');

        if(this.config){
            const user = await localforage.getItem<UserModel>('currentUser');
            if (user){
                this.userStorage = localStorage.createInstance(user.email);
                return user;
            }
        }
        
        return undefined;
    }

    ////////////////Equipment////////////////////////
    fetchEquipments = async(): Promise<EquipmentModel[]> => {
        return await this.getArrayOnlineFirst<EquipmentModel>(this.baseUrl + "equipments", "equipments", updateEquipment);
    }
    
    createOrSaveEquipment = async(equipmentToSave: EquipmentModel):Promise<EquipmentModel> => {
        if(equipmentToSave._id){
            equipmentToSave = await this.postAndUpdate<EquipmentModel>(this.baseUrl + "equipments/" + equipmentToSave._id, "equipment", equipmentToSave, updateEquipment);           
        }
        else{
            equipmentToSave = await this.postAndUpdate<EquipmentModel>(this.baseUrl + "equipments", "equipment", equipmentToSave, updateEquipment);
        }

        this.updateArrayInCache(this.baseUrl + "equipments", equipmentToSave);

        return equipmentToSave;
    }

    deleteEquipment = async (idEquipment: string): Promise<void> => {
        this.deleteAndUpdate(this.baseUrl + "equipments/" + idEquipment, "equipments");

        this.removeItemInCache(this.baseUrl + "equipments", idEquipment);
    }

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: TaskModel):Promise<TaskModel> =>{
        if(newTask._id === undefined){
            newTask = await this.postAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId, "task", newTask, updateTask);
        }
        else{
            newTask = await this.postAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId + '/' + newTask._id, "task", newTask, updateTask);
        }

        this.updateArrayInCache(this.baseUrl + "tasks/" + equipmentId, newTask);

        return newTask;
    }

    deleteTask = async(equipmentId: string, taskId: string): Promise<void> => {
        await this.deleteAndUpdate(this.baseUrl + "tasks/" + equipmentId + '/' + taskId, "task");
        this.removeItemInCache(this.baseUrl + "tasks/" + equipmentId, taskId);
    }

    fetchTasks = async(equipmentId: string): Promise<TaskModel[]> => {
        return await this.getArrayOnlineFirst(this.baseUrl + "tasks/" + equipmentId, "tasks", updateTask);
    }

    ///////////////////////////Entry////////////////////////

    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        if(newEntry._id === undefined){
            newEntry = await this.postAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId, "entry", newEntry, updateEntry);
        }
        else{
            newEntry = await this.postAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + newEntry._id, "entry", newEntry, updateEntry);
        }

        if (taskId === '-'){
            this.updateArrayInCache(this.baseUrl + "entries/" + equipmentId, newEntry);
        }
        else{
            this.updateArrayInCache(this.baseUrl + "entries/" + equipmentId + '/' + taskId, newEntry);
        }
        

        return newEntry;
    }

    deleteEntry = async(equipmentId: string, taskId: string, entryId: string): Promise<void> => {
        taskId = taskId === undefined ? '-' : taskId;

        await this.deleteAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + entryId, "entry");

        if (taskId === '-'){
            this.removeItemInCache(this.baseUrl + "entries/" + equipmentId, entryId);
        }
        else{
            this.removeItemInCache(this.baseUrl + "entries/" + equipmentId + '/' + taskId, entryId);
        }
    }

    fetchEntries = async(equipmentId: string, taskId: string):Promise<EntryModel[]> => {
        if (equipmentId === undefined || taskId === undefined)
            return [];

        return await this.getArrayOnlineFirst<EntryModel>(this.baseUrl + "entries/" + equipmentId + '/' + taskId, "entries", updateEntry);
    }

    fetchAllEntries = async(equipmentId: string):Promise<EntryModel[]> => {
        if (equipmentId === undefined)
            return [];

        return await this.getArrayOnlineFirst(this.baseUrl + "entries/" + equipmentId, "entries", updateEntry);
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

    async postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update:(date:T)=>T):Promise<T>{
        const data:any = {};
        data[keyName] = dataToPost;

        if(navigator.onLine){
            const savedData = (await this.post(url, data))[keyName];
            return update(savedData);
        }
        else{
            this.addAction<T>(url, ActionType.Post, data);
            return dataToPost;
        }
    }

    async deleteAndUpdate<T>(url: string, keyName: string):Promise<void>{
        if(navigator.onLine){
            (await this.delete(url))[keyName];
        }
        else{
            this.addAction<T>(url, ActionType.Delete);
        }
    }

    async addAction<T>(url: string, type:ActionType, data?: any){
        if(this.userStorage){
            const action:Action = {url: url, type: type, data: data};
            let history:Action[] = await this.userStorage.getItem<Action[]>("history");
            history = history === null ? [] : history;
            history.push(action);
            this.userStorage.setItem<Action[]>("history", history);
        }
    }

    async updateArrayInCache<T extends EntityModel>(key: string, item:T):Promise<void>{
        if(this.userStorage){
            const items = (await this.userStorage.getItem<T[]>(key))
                            .filter(i => i._uiId !== item._uiId);

            items.push(item);

            this.userStorage.setItem<T[]>(key, items);
        }
    }

    async removeItemInCache<T extends EntityModel>(key: string, itemId: string){
        if(this.userStorage){
            const items = (await this.userStorage.getItem<T[]>(key)).filter(i => i._id !== itemId);
            this.userStorage.setItem<T[]>(key, items);
        }
    }

    async getArrayOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T): Promise<T[]> {
        if(navigator.onLine){
            const data = (await this.get(url))[keyName] as T[];

            const initData = data.map(init);
            if(this.userStorage){
                this.userStorage.setItem<T[]>(url, initData);
            }

            return initData;
        }
        else{
            if (this.userStorage){
                const initData = await this.userStorage.getItem<T[]>(url);
                if(initData){
                    return initData;
                }
            }
        }

        return [];
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