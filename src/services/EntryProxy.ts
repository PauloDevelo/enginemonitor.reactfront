import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateEntry } from '../helpers/EntryHelper'
import { EntryModel} from '../types/Types'

export interface IEntryProxy{
    createOrSaveEntry(equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel>;
    deleteEntry(equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel>;
    fetchEntries(equipmentId: string, taskId: string):Promise<EntryModel[]>;
    fetchAllEntries(equipmentId: string):Promise<EntryModel[]>;

    existEntry(equipmentId: string, entryId: string | undefined):Promise<boolean>;
}

class EntryProxy implements IEntryProxy{
    baseUrl = process.env.REACT_APP_URL_BASE + "entries/";

    ///////////////////////////Entry////////////////////////
    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        newEntry = await progressiveHttpProxy.postAndUpdate(this.baseUrl + equipmentId + '/' + taskId + '/' + newEntry._uiId, "entry", newEntry, updateEntry);

        await storageService.updateArray(this.baseUrl + equipmentId, newEntry);

        return newEntry;
    }

    deleteEntry = async(equipmentId: string, taskId: string | undefined, entryId: string): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        await progressiveHttpProxy.deleteAndUpdate(this.baseUrl + equipmentId + '/' + taskId + '/' + entryId, "entry", updateEntry);

        const deletedEntry = await storageService.removeItemInArray<EntryModel>(this.baseUrl + equipmentId, entryId);
        return updateEntry(deletedEntry);
    }

    fetchEntries = async(equipmentId: string, taskId: string, forceToLookUpInStorage: boolean = false):Promise<EntryModel[]> => {
        if (equipmentId === undefined || taskId === undefined)
            return [];

        const allEntries = await this.fetchAllEntries(equipmentId, forceToLookUpInStorage);

        return allEntries.filter(entry => entry.taskUiId === taskId);
    }

    fetchAllEntries = async(equipmentId: string, forceToLookUpInStorage: boolean = false):Promise<EntryModel[]> => {
        if (equipmentId === undefined)
            return [];

        if(forceToLookUpInStorage){
            return await storageService.getArray(this.baseUrl + equipmentId);
        }

        return await progressiveHttpProxy.getArrayOnlineFirst<EntryModel>(this.baseUrl + equipmentId, "entries", updateEntry);
    }

    existEntry = async (equipmentId: string, entryId: string | undefined):Promise<boolean> => {
        if (entryId === undefined){
            return false;
        }

        const allEntries = await this.fetchAllEntries(equipmentId, true);

        return allEntries.findIndex(entry => entry._uiId === entryId) !== -1;
    }
}

const entryProxy:IEntryProxy = new EntryProxy();
export default entryProxy;
