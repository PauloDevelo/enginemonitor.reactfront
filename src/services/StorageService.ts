import * as log from 'loglevel';
import localforage from 'localforage';

// eslint-disable-next-line no-unused-vars
import { UserModel, EntityModel } from '../types/Types';

localforage.config({
  driver: localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name: 'maintenance reminder',
  version: 1.0,
  size: 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description: 'Contains all the information contained in Maintenance monitor',
});

export interface IUserStorageListener{
    onUserStorageOpened(): Promise<void>;
    onUserStorageClosed(): Promise<void>;
}

export interface IStorageService{
    existGlobalItem(key: string): Promise<boolean>;
    setGlobalItem<T>(key: string, value: T): Promise<T>;
    removeGlobalItem(key: string): Promise<void>;
    getGlobalItem<T>(key: string): Promise<T>;

    isUserStorageOpened(): boolean;
    openUserStorage(user: UserModel): Promise<void>;
    closeUserStorage(): Promise<void>;
    registerUserStorageListener(listener: IUserStorageListener): void;
    unregisterUserStorageListener(listener: IUserStorageListener): void;
    getUserStorage(): LocalForage;

    removeItem<T>(key: string): Promise<void>;
    setItem<T>(key: string, value: T): Promise<T>;
    getItem<T>(key: string): Promise<T>;
    getArray<T>(key: string): Promise<T[]>;
    existItem(key: string): Promise<boolean>;

    updateArray<T extends EntityModel>(key: string, item:T):Promise<T[]>;
    removeItemInArray<T extends EntityModel>(key: string, itemId: string): Promise<T>;
}

class StorageService implements IStorageService {
    private userStorageListeners:IUserStorageListener[] = [];

    private userStorage: LocalForage | undefined;

    // eslint-disable-next-line class-methods-use-this
    async existGlobalItem(key: string): Promise<boolean> {
      try {
        const keys = await localforage.keys();
        return keys.includes(key);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    // eslint-disable-next-line class-methods-use-this
    async setGlobalItem<T>(key: string, value: T): Promise<T> {
      try {
        return localforage.setItem<T>(key, value);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    // eslint-disable-next-line class-methods-use-this
    async removeGlobalItem(key: string): Promise<void> {
      try {
        localforage.removeItem(key);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    // eslint-disable-next-line class-methods-use-this
    async getGlobalItem<T>(key: string): Promise<T> {
      try {
        return localforage.getItem(key);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    registerUserStorageListener(listener: IUserStorageListener): void{
      this.userStorageListeners.push(listener);
    }

    unregisterUserStorageListener(listenerToRemove: IUserStorageListener): void{
      this.userStorageListeners = this.userStorageListeners.filter((listener) => listener !== listenerToRemove);
    }

    isUserStorageOpened(): boolean {
      return this.userStorage !== undefined;
    }

    async openUserStorage({ email }: UserModel): Promise<void> {
      this.userStorage = localforage.createInstance({
        name: email,
      });
      return this.triggerOnUserStorageOpened();
    }

    async closeUserStorage(): Promise<void> {
      this.userStorage = undefined;
      return this.triggerOnUserStorageClosed();
    }

    async updateArray<T extends EntityModel>(key: string, item:T):Promise<T[]> {
      let items = await this.getUserStorage().getItem<T[]>(key);

      if (items) {
        items = items.filter((i) => i._uiId !== item._uiId);
      } else {
        items = [];
      }

      items.push(item);

      return this.getUserStorage().setItem<T[]>(key, items);
    }

    async removeItemInArray<T extends EntityModel>(key: string, itemId: string): Promise<T> {
      const items = await this.getUserStorage().getItem<T[]>(key);

      const newItems = items.filter((i) => i._uiId !== itemId);
      const removedItem = items.find((i) => i._uiId === itemId);

      if (removedItem) {
        await this.getUserStorage().setItem<T[]>(key, newItems);
        return removedItem;
      }

      throw new Error(`The item ${itemId} cannot be found in the array ${key}`);
    }

    async setItem<T>(key: string, value: T): Promise<T> {
      if (value === undefined || value === null) {
        await this.getUserStorage().removeItem(key);
        return value;
      }

      return this.getUserStorage().setItem<T>(key, value);
    }

    async getItem<T>(key: string): Promise<T> {
      return this.getUserStorage().getItem<T>(key);
    }

    async existItem(key: string): Promise<boolean> {
      const keys = await this.getUserStorage().keys();
      return keys.includes(key);
    }

    async removeItem<T>(key: string): Promise<void> {
      return this.getUserStorage().removeItem(key);
    }

    async getArray<T>(key: string):Promise<T[]> {
      const array = await this.getUserStorage().getItem<T[]>(key);
      if (array) {
        return array;
      }

      return [];
    }

    getUserStorage(): LocalForage {
      if (this.userStorage) {
        return this.userStorage;
      }

      throw new Error('The storage is undefined yet. You must connect first.');
    }

    private async triggerOnUserStorageOpened():Promise<void> {
      await Promise.all(this.userStorageListeners.map(async (listener) => {
        await listener.onUserStorageOpened();
      }));
    }

    private async triggerOnUserStorageClosed():Promise<void> {
      await Promise.all(this.userStorageListeners.map(async (listener) => {
        await listener.onUserStorageClosed();
      }));
    }
}

const storageService: IStorageService = new StorageService();
export default storageService;
