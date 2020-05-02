// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import _ from 'lodash';
import progressiveHttpProxy from './ProgressiveHttpProxy';

// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';

import { updateEntry } from '../helpers/EntryHelper';
// eslint-disable-next-line no-unused-vars
import { EntryModel, AssetModel, extractEntryModel } from '../types/Types';
import imageProxy from './ImageProxy';

import assetManager from './AssetManager';

export interface FetchEntriesProps extends FetchAllEntriesProps{
    taskId: string|undefined;
}
export interface FetchAllEntriesProps{
    equipmentId: string|undefined;
    cancelToken?: CancelToken;
    forceToLookUpInStorage?: boolean;
    cancelTimeout?: boolean;
}
export interface IEntryProxy{
    getBaseEntryUrl(equipmentId?: string): string;

    createOrSaveEntry(equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel>;
    deleteEntry(equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel>;

    fetchEntries(props: FetchEntriesProps):Promise<EntryModel[]>;
    fetchAllEntries(props: FetchAllEntriesProps):Promise<EntryModel[]>;

    getStoredEntries(equipmentId: string, taskId?: string):Promise<EntryModel[]>;

    existEntry(equipmentId: string, entryId: string | undefined):Promise<boolean>;

    onTaskDeleted(equipmentId: string, taskId: string): Promise<void>;
    onEquipmentDeleted(equipmentId: string): Promise<void>;
}

class EntryProxy implements IEntryProxy, IUserStorageListener {
    private baseUrl = `${process.env.REACT_APP_API_URL_BASE}entries/`;

    private inMemory: { [url: string]: EntryModel[]} = {};

    constructor() {
      assetManager.registerOnCurrentAssetChanged(this.updateBaseUrl);
      storageService.registerUserStorageListener(this);
    }

    public onUserStorageOpened = async (): Promise<void> => {
      this.inMemory = {};

      const keys = await storageService.getUserStorage().keys();
      const entriesKeys = _.filter(keys, (key) => _.startsWith(key, this.baseUrl));

      const updateInMemory = async (entriesKey: string): Promise<void> => {
        this.inMemory[entriesKey] = await progressiveHttpProxy.getArrayFromStorage({ url: entriesKey, init: updateEntry });
      };

      await Promise.all(entriesKeys.map((entriesKey) => updateInMemory(entriesKey)));
    }

    public onUserStorageClosed = async (): Promise<void> => {
      this.inMemory = {};
    }

    updateBaseUrl = (asset: AssetModel | undefined | null) => {
      this.baseUrl = `${process.env.REACT_APP_API_URL_BASE}entries/${asset?._uiId}/`;
    }

    getBaseEntryUrl = (equipmentId: string | undefined): string => {
      if (equipmentId === undefined) {
        return this.baseUrl;
      }

      return this.baseUrl + equipmentId;
    }

    // /////////////////////////Entry////////////////////////
    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
      const taskIdStr = taskId === undefined ? '-' : taskId;

      const updatedNewEntry = await progressiveHttpProxy.postAndUpdate(`${this.getBaseEntryUrl(equipmentId)}/${taskIdStr}/${newEntry._uiId}`, 'entry', extractEntryModel(newEntry), updateEntry);

      const updatedEntries = await storageService.updateArray(this.getBaseEntryUrl(equipmentId), updatedNewEntry);
      this.inMemory[this.getBaseEntryUrl(equipmentId)] = updatedEntries.map(updateEntry);

      return updatedNewEntry;
    }

    deleteEntry = async (equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel> => {
      const taskIdStr = taskId === undefined ? '-' : taskId;

      await progressiveHttpProxy.delete(`${this.getBaseEntryUrl(equipmentId)}/${taskIdStr}/${entryId}`);

      return this.removeEntryInStorage(equipmentId, entryId);
    }

    fetchEntries = async ({
      equipmentId, taskId, cancelToken = undefined, forceToLookUpInStorage = false, cancelTimeout = false,
    }: FetchEntriesProps):Promise<EntryModel[]> => {
      if (equipmentId === undefined || taskId === undefined) { return []; }

      const allEntries = await this.fetchAllEntries({
        equipmentId, cancelToken, forceToLookUpInStorage, cancelTimeout,
      });

      return allEntries.filter((entry) => entry.taskUiId === taskId);
    }

    fetchAllEntries = async ({
      equipmentId, cancelToken = undefined, forceToLookUpInStorage = false, cancelTimeout = false,
    }:FetchAllEntriesProps):Promise<EntryModel[]> => {
      if (equipmentId === undefined) { return []; }

      if (forceToLookUpInStorage) {
        const storedEntries = _.get(this.inMemory, this.getBaseEntryUrl(equipmentId), null);
        if (storedEntries !== null) {
          return storedEntries;
        }

        throw new Error(`The entries for ${equipmentId} are not stored yet ...`);
      }

      const entries = await progressiveHttpProxy.getArrayOnlineFirst<EntryModel>({
        url: this.getBaseEntryUrl(equipmentId), keyName: 'entries', init: updateEntry, cancelToken, cancelTimeout,
      });
      this.inMemory[this.getBaseEntryUrl(equipmentId)] = entries;

      return entries;
    }

    getStoredEntries = async (equipmentId: string, taskId: string | undefined = undefined):Promise<EntryModel[]> => {
      if (taskId !== undefined) {
        return this.fetchEntries({ equipmentId, taskId, forceToLookUpInStorage: true });
      }

      return this.fetchAllEntries({ equipmentId, forceToLookUpInStorage: true });
    }

    existEntry = async (equipmentId: string, entryId: string | undefined):Promise<boolean> => {
      if (entryId === undefined) {
        return false;
      }

      const allEntries = await this.getStoredEntries(equipmentId);

      return allEntries.findIndex((entry) => entry._uiId === entryId) !== -1;
    }

    onTaskDeleted = async (equipmentId: string, taskId: string): Promise<void> => {
      const entries = await this.getStoredEntries(equipmentId, taskId);

      await entries.reduce(async (previousPromise, entry) => {
        await previousPromise;
        await this.removeEntryInStorage(equipmentId, entry._uiId);
      }, Promise.resolve());
    }

    onEquipmentDeleted = async (equipmentId: string): Promise<void> => {
      const entries = await this.getStoredEntries(equipmentId);

      await entries.reduce(async (previousPromise, entry) => {
        await previousPromise;
        await this.removeEntryInStorage(equipmentId, entry._uiId);
      }, Promise.resolve());
    }

    private removeEntryInStorage = async (equipmentUiId: string, entryUiId: string): Promise<EntryModel> => {
      const entryDeleted = updateEntry(await storageService.removeItemInArray<EntryModel>(this.getBaseEntryUrl(equipmentUiId), entryUiId));
      _.remove(this.inMemory[this.getBaseEntryUrl(equipmentUiId)], (entry) => entry._uiId === entryDeleted._uiId);

      await imageProxy.onEntityDeleted(entryUiId);

      return entryDeleted;
    }
}

const entryProxy:IEntryProxy = new EntryProxy();
export default entryProxy;
