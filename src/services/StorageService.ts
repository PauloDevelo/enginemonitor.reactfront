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



export interface IStorageService{
    setGlobalItem<T>(key: string, value: T): Promise<T>;
    removeGlobalItem(key: string): Promise<void>;
    getGlobalItem<T>(key: string): Promise<T>;

    openUserStorage(user: UserModel): void;
    closeUserStorage(): void;

    setItem<T>(key: string, value: T): Promise<T>;
    getItem<T>(key: string): Promise<T>;

    updateArray<T extends EntityModel>(key: string, item:T):Promise<void>;
    removeItemInArray<T extends EntityModel>(key: string, itemId: string): Promise<T>;
};

class StorageService implements IStorageService{
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

    openUserStorage(user: UserModel): void{
        this.userStorage = localforage.createInstance({
            name: user.email
        });
    }

    closeUserStorage(): void{
        this.userStorage = undefined;
    }

    async updateArray<T extends EntityModel>(key: string, item:T):Promise<void>{
        let items = (await this.getUserStorage().getItem<T[]>(key));
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
        const items = (await this.getUserStorage().getItem<T[]>(key));

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
        return this.getUserStorage().setItem<T>(key, value);
    }

    async getItem<T>(key: string): Promise<T>{
        return this.getUserStorage().getItem<T>(key);
    }

    private getUserStorage(): LocalForage{
        if(this.userStorage){
            return this.userStorage;
        }

        throw new Error("The storage is undefined yet. You must connect first.");
    }
}

const storageService: IStorageService = new StorageService();
export default storageService;