import axios from "axios";
import axiosRetry from 'axios-retry';

import isOnline from './SyncService';

import storageService, { Action, ActionType } from '../services/StorageService';

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

export interface IUserProxy{
    signup(newUser: UserModel): Promise<void>;
    sendVerificationEmail(email: string): Promise<void>;
    resetPassword(email: string, password: string): Promise<void>;
    authenticate (authInfo: AuthInfo):Promise<UserModel>;
    logout(): Promise<void>;
    fetchCurrentUser():Promise<UserModel | undefined>;
}

export interface IEquipmentProxy{
    fetchEquipments(): Promise<EquipmentModel[]>;
    createOrSaveEquipment(equipmentToSave: EquipmentModel):Promise<EquipmentModel>;
    deleteEquipment(idEquipment: string): Promise<EquipmentModel>;

    existEquipment(equipmentId: string | undefined):Promise<boolean>;
}

export interface ITaskProxy{
    createOrSaveTask(equipmentId: string, newTask: TaskModel):Promise<TaskModel>;
    deleteTask(equipmentId: string, taskId: string): Promise<TaskModel>;
    fetchTasks(equipmentId: string): Promise<TaskModel[]>;

    existTask(equipmentId: string | undefined, taskId: string | undefined):Promise<boolean>;
}

export interface IEntryProxy{
    createOrSaveEntry(equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel>;
    deleteEntry(equipmentId: string, taskId: string, entryId: string): Promise<EntryModel>;
    fetchEntries(equipmentId: string, taskId: string):Promise<EntryModel[]>;
    fetchAllEntries(equipmentId: string):Promise<EntryModel[]>;

    existEntry(equipmentId: string | undefined, entryId: string | undefined):Promise<boolean>;
}

export interface IActionProxy{
    performAction(action: Action):Promise<void>;
}

class EquipmentMonitorServiceProxy implements IUserProxy, IEquipmentProxy, ITaskProxy, IEntryProxy, IActionProxy{
    private config:Config | undefined;

    baseUrl = process.env.REACT_APP_URL_BASE;

    constructor(){
        axiosRetry(axios, { retries: 1, retryDelay: () => 1000 });
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
                storageService.setGlobalItem('EquipmentMonitorServiceProxy.config', this.config);
                storageService.setGlobalItem('currentUser', user);
            }

            storageService.openUserStorage(user);

            return user;
        }
        
        throw new HttpError( { loginerror: "loginfailed"} );
    }

    logout = async (): Promise<void> => {
        storageService.removeGlobalItem('EquipmentMonitorServiceProxy.config');
        storageService.removeGlobalItem('currentUser');
        this.config = undefined;
        storageService.closeUserStorage();
    }

    fetchCurrentUser = async():Promise<UserModel | undefined> => {
        this.config = await storageService.getGlobalItem<Config>('EquipmentMonitorServiceProxy.config');

        if(this.config){
            const user = await storageService.getGlobalItem<UserModel>('currentUser');
            if (user){
                storageService.openUserStorage(user);
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
        equipmentToSave = await this.postAndUpdate<EquipmentModel>(this.baseUrl + "equipments/" + equipmentToSave._uiId, "equipment", equipmentToSave, updateEquipment);           

        storageService.updateArray(this.baseUrl + "equipments", equipmentToSave);

        return equipmentToSave;
    }

    deleteEquipment = async (idEquipment: string): Promise<EquipmentModel> => {
        await this.deleteAndUpdate<EquipmentModel>(this.baseUrl + "equipments/" + idEquipment, "equipments");

        return storageService.removeItemInArray<EquipmentModel>(this.baseUrl + "equipments", idEquipment);
    }

    existEquipment = async (equipmentId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined){
            return false;
        }

        const allEquipments = await this.fetchEquipments();

        return allEquipments.findIndex(equipment => equipment._uiId === equipmentId) !== -1;
    }

    /////////////////Task////////////////////////////
    createOrSaveTask = async (equipmentId: string, newTask: TaskModel):Promise<TaskModel> =>{
        newTask = await this.postAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId + '/' + newTask._uiId, "task", newTask, updateTask);

        await storageService.updateArray(this.baseUrl + "tasks/" + equipmentId, newTask);

        return newTask;
    }

    deleteTask = async(equipmentId: string, taskId: string): Promise<TaskModel> => {
        await this.deleteAndUpdate<TaskModel>(this.baseUrl + "tasks/" + equipmentId + '/' + taskId, "task");

        return storageService.removeItemInArray<TaskModel>(this.baseUrl + "tasks/" + equipmentId, taskId);
    }

    fetchTasks = async(equipmentId: string): Promise<TaskModel[]> => {
        return await this.getArrayOnlineFirst(this.baseUrl + "tasks/" + equipmentId, "tasks", updateTask);
    }

    existTask = async (equipmentId: string | undefined, taskId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || taskId === undefined){
            return false;
        }

        const allTasks = await this.fetchTasks(equipmentId);

        return allTasks.findIndex(task => task._uiId === taskId) !== -1;
    }

    ///////////////////////////Entry////////////////////////

    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        newEntry = await this.postAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + newEntry._uiId, "entry", newEntry, updateEntry);

        await storageService.updateArray(this.baseUrl + "entries/" + equipmentId, newEntry);

        return newEntry;
    }

    deleteEntry = async(equipmentId: string, taskId: string, entryId: string): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        await this.deleteAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + entryId, "entry");

        return storageService.removeItemInArray<EntryModel>(this.baseUrl + "entries/" + equipmentId, entryId);
    }

    fetchEntries = async(equipmentId: string, taskId: string):Promise<EntryModel[]> => {
        if (equipmentId === undefined || taskId === undefined)
            return [];

        const allEntries = await this.fetchAllEntries(equipmentId);

        return allEntries.filter(entry => entry.taskUiId === taskId);
    }

    fetchAllEntries = async(equipmentId: string):Promise<EntryModel[]> => {
        if (equipmentId === undefined)
            return [];

        return await this.getArrayOnlineFirst<EntryModel>(this.baseUrl + "entries/" + equipmentId, "entries", updateEntry);
    }

    existEntry = async (equipmentId: string | undefined, entryId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || entryId === undefined){
            return false;
        }

        const allEntries = await this.fetchAllEntries(equipmentId);

        return allEntries.findIndex(entry => entry._uiId === entryId) !== -1;
    }

    //////////////////////////Http actions////////////////////////////
    post = async (url: string, data: any) => {
        try{
            const response = await axios.post(url, data, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }
    
    deleteReq = async (url: string) => {
        try{
            const response = await axios.delete(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }

    get = async (url: string) => {
        try{
            const response = await axios.get(url, this.config);
		    return response.data;
        }
        catch(error){
            this.processError(error);
        }
    }

    async postAndUpdate<T>(url: string, keyName:string, dataToPost:T, update:(date:T)=>T):Promise<T> {
        const data:any = {[keyName]: dataToPost};

        if(await isOnline()){
            const savedData = (await this.post(url, data))[keyName];

            return update(savedData);
        }
        else{
            const action: Action = { key: url, type: ActionType.Post, data: data };
            storageService.addAction(action);

            return dataToPost;
        }
    }

    async deleteAndUpdate<T>(url: string, keyName: string):Promise<T|undefined>{
        if(await isOnline()){
            return (await this.deleteReq(url))[keyName];
        }
        else{
            const action: Action = { key: url, type: ActionType.Delete };
            storageService.addAction(action);

            return undefined
        }
    }

    async getArrayOnlineFirst<T>(url: string, keyName:string, init:(model:T) => T): Promise<T[]> {
        if(await isOnline()){
            const array = (await this.get(url))[keyName] as T[];
            const initArray = array.map(init);

            storageService.setItem<T[]>(url, initArray);

            return initArray;
        }
        else {
            const array = await storageService.getItem<T[]>(url);
            if(array){
                return array;
            }
        }

        return [];
    }

    performAction = async (action: Action):Promise<void> => {
        if(action.type === ActionType.Post){
            await this.post(action.key, action.data);
        }
        else if(action.type === ActionType.Delete){
            await this.deleteReq(action.key);
        }
        else{
            throw new Error("The action type " + action.type + "is not recognized.");
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

const actionProxy:IActionProxy = EquipmentMonitorService;
export const userProxy:IUserProxy = EquipmentMonitorService;
export const equipmentProxy:IEquipmentProxy = EquipmentMonitorService;
export const taskProxy:ITaskProxy = EquipmentMonitorService;
export const entryProxy:IEntryProxy = EquipmentMonitorService;

export default actionProxy;
