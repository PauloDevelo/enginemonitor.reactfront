import * as log from 'loglevel';
import localforage from 'localforage';

import storageUpdaterService from './StorageUpdaterService';

// eslint-disable-next-line no-unused-vars
import { UserModel, EntityModel } from '../types/Types';

let initialisation: Promise<void>;

if (process.env.NODE_ENV === 'test') {
  const init = async () => {
    const { default: memoryStorageDriver } = await import('localforage-memoryStorageDriver');
    await localforage.defineDriver(memoryStorageDriver);
    await localforage.setDriver(memoryStorageDriver._driver);
  };

  initialisation = init();
} else {
  localforage.config({
    driver: localforage.INDEXEDDB, // WebSQL seems to not work with Firefox
    name: 'maintenance reminder',
    version: 1.0,
    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
    description: 'Contains all the information contained in Maintenance monitor',
  });

  initialisation = Promise.resolve();
}


export interface IUserStorageListener{
    onUserStorageOpened(): Promise<void>;
    onUserStorageClosed(): Promise<void>;
}

export interface IStorageService{
    getStorageVersion(): Promise<number>;
    setStorageVersion(newVersion: number): Promise<number>;

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
    private static readonly storageVersionKey = 'storageVersion';

    private userStorageListeners:IUserStorageListener[] = [];

    private userStorage: LocalForage | undefined;

    async getStorageVersion(): Promise<number> {
      if (await this.existItem(StorageService.storageVersionKey)) {
        return this.getItem<number>(StorageService.storageVersionKey);
      }

      return Promise.resolve(0);
    }

    async setStorageVersion(newVersion: number): Promise<number> {
      return this.setItem<number>(StorageService.storageVersionKey, newVersion);
    }

    // eslint-disable-next-line class-methods-use-this
    async existGlobalItem(key: string): Promise<boolean> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

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
      if (!key) {
        throw new Error('The key should be truthy');
      }

      try {
        return localforage.setItem<T>(key, value);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    // eslint-disable-next-line class-methods-use-this
    async removeGlobalItem(key: string): Promise<void> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      try {
        localforage.removeItem(key);
      } catch (error) {
        log.error(error);
        throw error;
      }
    }

    // eslint-disable-next-line class-methods-use-this
    async getGlobalItem<T>(key: string): Promise<T> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      try {
        const item = await localforage.getItem<T>(key);

        if (item === null) {
          throw new Error(`The key ${key} doesn't exist in the global storage`);
        }

        return item;
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

    async openUserStorage({ _uiId }: UserModel): Promise<void> {
      await initialisation;

      this.userStorage = localforage.createInstance({
        name: _uiId,
      });

      await storageUpdaterService.onUserStorageOpened();

      return this.triggerOnUserStorageOpened();
    }

    async closeUserStorage(): Promise<void> {
      this.userStorage = undefined;
      return this.triggerOnUserStorageClosed();
    }

    async updateArray<T extends EntityModel>(key: string, item:T):Promise<T[]> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      if (!item) {
        throw new Error('The item to update in the array should be truthy');
      }

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
      if (!key) {
        throw new Error('The key should be truthy');
      }

      if (!itemId) {
        throw new Error('The item id should be truthy');
      }

      const items = await this.getUserStorage().getItem<T[]>(key);

      if (items === null) {
        throw new Error(`There is nothing to remove in ${key}.`);
      }

      const newItems = items.filter((i) => i._uiId !== itemId);
      const removedItem = items.find((i) => i._uiId === itemId);

      if (removedItem) {
        await this.getUserStorage().setItem<T[]>(key, newItems);
        return removedItem;
      }

      throw new Error(`The item ${itemId} cannot be found in the array ${key}`);
    }

    async setItem<T>(key: string, value: T): Promise<T> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      if (value === undefined || value === null) {
        await this.getUserStorage().removeItem(key);
        return value;
      }

      return this.getUserStorage().setItem<T>(key, value);
    }

    async getItem<T>(key: string): Promise<T> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      const item = await this.getUserStorage().getItem<T>(key);

      if (item === null) {
        throw new Error(`There is nothing in the storage for ${key}.`);
      }

      return item;
    }

    async existItem(key: string): Promise<boolean> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      const keys = await this.getUserStorage().keys();
      return keys.includes(key) ? (await this.getUserStorage().getItem(key) !== undefined) : false;
    }

    async removeItem<T>(key: string): Promise<void> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

      return this.getUserStorage().removeItem(key);
    }

    async getArray<T>(key: string):Promise<T[]> {
      if (!key) {
        throw new Error('The key should be truthy');
      }

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
