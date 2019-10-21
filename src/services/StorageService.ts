import localforage from 'localforage';
import { UserModel, EntityModel } from '../types/Types';

localforage.config({
    driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
    name        : 'maintenance reminder',
    version     : 1.0,
    size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
    description : 'Contains all the information contained in Maintenance monitor'
});

export interface IUserStorageListener{
    onUserStorageOpened(): Promise<void>;
    onUserStorageClosed(): Promise<void>;
}

export interface IStorageService{
    setGlobalItem<T>(key: string, value: T): Promise<T>;
    removeGlobalItem(key: string): Promise<void>;
    getGlobalItem<T>(key: string): Promise<T>;

    isUserStorageOpened(): boolean;
    openUserStorage(user: UserModel): Promise<void>;
    closeUserStorage(): Promise<void>;
    registerUserStorageListener(listener: IUserStorageListener): void;
    unregisterUserStorageListener(listener: IUserStorageListener): void;

    setItem<T>(key: string, value: T): Promise<T>;
    getItem<T>(key: string): Promise<T>;
    getArray<T>(key: string): Promise<T[]>;

    updateArray<T extends EntityModel>(key: string, item:T):Promise<void>;
    removeItemInArray<T extends EntityModel>(key: string, itemId: string): Promise<T>;
};

class StorageService implements IStorageService{
    private userStorageListeners:IUserStorageListener[] = [];
    private userStorage: LocalForage | undefined;

    async setGlobalItem<T>(key: string, value: T): Promise<T> {
        try{
            return localforage.setItem<T>(key, value);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    async removeGlobalItem(key: string): Promise<void>{
        try{
            localforage.removeItem(key);
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    async getGlobalItem<T>(key: string): Promise<T>{
        try{
            return localforage.getItem(key)
        }
        catch(error){
            console.error(error);
            throw error;
        }
    }

    registerUserStorageListener(listener: IUserStorageListener): void{
        this.userStorageListeners.push(listener);
    }

    unregisterUserStorageListener(listenerToRemove: IUserStorageListener): void{
        this.userStorageListeners = this.userStorageListeners.filter(listener => listener !== listenerToRemove);
    }

    isUserStorageOpened(): boolean{
        return this.userStorage !== undefined;
    }

    async openUserStorage(user: UserModel): Promise<void>{
        this.userStorage = localforage.createInstance({
            name: user.email
        });
        return await this.triggerOnUserStorageOpened();
    }

    async closeUserStorage(): Promise<void>{
        this.userStorage = undefined;
        return await this.triggerOnUserStorageClosed();
    }

    async updateArray<T extends EntityModel>(key: string, item:T):Promise<void>{
        let items = await this.getUserStorage().getItem<T[]>(key);
        
        if (items){
            items = items.filter(i => i._uiId !== item._uiId);
        }
        else{
            items = [];
        }

        items.push(item);

        this.getUserStorage().setItem<T[]>(key, items);
    }

    async removeItemInArray<T extends EntityModel>(key: string, itemId: string): Promise<T>{
        const items = await this.getUserStorage().getItem<T[]>(key);

        const newItems = items.filter(i => i._uiId !== itemId);
        const removedItem = items.find(i => i._uiId === itemId);

        if(removedItem){
            await this.getUserStorage().setItem<T[]>(key, newItems);
            return removedItem;
        }
        else{
            throw new Error("The item " + itemId + " cannot be found in the array " + key);
        }
    }

    async setItem<T>(key: string, value: T): Promise<T>{
        if (value === undefined || value === null){
            await this.getUserStorage().removeItem(key);    
            return value;
        }
        
        return await this.getUserStorage().setItem<T>(key, value);
    }

    async getItem<T>(key: string): Promise<T>{
        return await this.getUserStorage().getItem<T>(key);
    }

    async getArray<T>(key: string):Promise<T[]>{
        const array = await this.getUserStorage().getItem<T[]>(key);
        if(array){
            return array;
        }

        return [];
    }

    private getUserStorage(): LocalForage{
        if(this.userStorage){
            return this.userStorage;
        }

        throw new Error("The storage is undefined yet. You must connect first.");
    }

    private async triggerOnUserStorageOpened():Promise<void>{
        await Promise.all(this.userStorageListeners.map(async (listener) => {
            await listener.onUserStorageOpened();
        }));
    }

    private async triggerOnUserStorageClosed():Promise<void>{
        await Promise.all(this.userStorageListeners.map(async (listener) => {
            await listener.onUserStorageClosed();
        }));
    }
}

const storageService: IStorageService = new StorageService();
export default storageService;