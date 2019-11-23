// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateEntry } from '../helpers/EntryHelper';
// eslint-disable-next-line no-unused-vars
import { EntryModel } from '../types/Types';
import imageProxy from './ImageProxy';

export interface FetchEntriesProps extends FetchAllEntriesProps{
    taskId: string|undefined;
}

export interface FetchAllEntriesProps{
    equipmentId: string|undefined;
    cancelToken?: CancelToken;
    forceToLookUpInStorage?: boolean;
}
export interface IEntryProxy{
    createOrSaveEntry(equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel>;
    deleteEntry(equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel>;


    fetchEntries(props: FetchEntriesProps):Promise<EntryModel[]>;
    fetchAllEntries(props: FetchAllEntriesProps):Promise<EntryModel[]>;

    getStoredEntries(equipmentId: string, taskId: string | undefined):Promise<EntryModel[]>;

    existEntry(equipmentId: string, entryId: string | undefined):Promise<boolean>;

    onTaskDeleted(equipmentId: string, taskId: string): Promise<void>;
    onEquipmentDeleted(equipmentId: string): Promise<void>;
}

class EntryProxy implements IEntryProxy {
    baseUrl = `${process.env.REACT_APP_URL_BASE}entries/`;

    // /////////////////////////Entry////////////////////////
    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
      const taskIdStr = taskId === undefined ? '-' : taskId;

      const updatedNewEntry = await progressiveHttpProxy.postAndUpdate(`${this.baseUrl + equipmentId}/${taskIdStr}/${newEntry._uiId}`, 'entry', newEntry, updateEntry);

      await storageService.updateArray(this.baseUrl + equipmentId, updatedNewEntry);

      return updatedNewEntry;
    }

    deleteEntry = async (equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel> => {
      const taskIdStr = taskId === undefined ? '-' : taskId;

      await progressiveHttpProxy.deleteAndUpdate(`${this.baseUrl + equipmentId}/${taskIdStr}/${entryId}`, 'entry', updateEntry);

      const deletedEntry = updateEntry(await storageService.removeItemInArray<EntryModel>(this.baseUrl + equipmentId, entryId));
      imageProxy.onEntityDeleted(deletedEntry._uiId);

      return deletedEntry;
    }

    fetchEntries = async ({
      equipmentId, taskId, cancelToken = undefined, forceToLookUpInStorage = false,
    }: FetchEntriesProps):Promise<EntryModel[]> => {
      if (equipmentId === undefined || taskId === undefined) { return []; }

      const allEntries = await this.fetchAllEntries({ equipmentId, cancelToken, forceToLookUpInStorage });

      return allEntries.filter((entry) => entry.taskUiId === taskId);
    }

    fetchAllEntries = async ({ equipmentId, cancelToken = undefined, forceToLookUpInStorage = false }:FetchAllEntriesProps):Promise<EntryModel[]> => {
      if (equipmentId === undefined) { return []; }

      if (forceToLookUpInStorage) {
        return storageService.getArray(this.baseUrl + equipmentId);
      }

      return progressiveHttpProxy.getArrayOnlineFirst<EntryModel>(this.baseUrl + equipmentId, 'entries', updateEntry, cancelToken);
    }

    getStoredEntries = async (equipmentId: string, taskId: string | undefined = undefined):Promise<EntryModel[]> => {
      if (taskId !== undefined) {
        return this.fetchEntries({ equipmentId, taskId, forceToLookUpInStorage: true });
      }

      return this.fetchAllEntries({ equipmentId, cancelToken: undefined, forceToLookUpInStorage: true });
    }

    existEntry = async (equipmentId: string, entryId: string | undefined):Promise<boolean> => {
      if (entryId === undefined) {
        return false;
      }

      const allEntries = await this.fetchAllEntries({ equipmentId, cancelToken: undefined, forceToLookUpInStorage: true });

      return allEntries.findIndex((entry) => entry._uiId === entryId) !== -1;
    }

    onTaskDeleted = async (equipmentId: string, taskId: string): Promise<void> => {
      const entries = await this.getStoredEntries(equipmentId, taskId);

      await entries.reduce(async (previousPromise, entry) => {
        await previousPromise;
        await storageService.removeItemInArray<EntryModel>(this.baseUrl + equipmentId, entry._uiId);
        await imageProxy.onEntityDeleted(entry._uiId);
      }, Promise.resolve());
    }

    onEquipmentDeleted = async (equipmentId: string): Promise<void> => {
      const entries = await this.getStoredEntries(equipmentId);


      await entries.reduce(async (previousPromise, entry) => {
        await previousPromise;
        await storageService.removeItemInArray<EntryModel>(this.baseUrl + equipmentId, entry._uiId);
        await imageProxy.onEntityDeleted(entry._uiId);
      }, Promise.resolve());
    }
}

const entryProxy:IEntryProxy = new EntryProxy();
export default entryProxy;
