import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';

import { updateEntry } from '../helpers/EntryHelper'
import { EntryModel} from '../types/Types'

export interface IEntryProxy{
    createOrSaveEntry(equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel>;
    deleteEntry(equipmentId: string, taskId: string, entryId: string): Promise<EntryModel>;
    fetchEntries(equipmentId: string, taskId: string):Promise<EntryModel[]>;
    fetchAllEntries(equipmentId: string):Promise<EntryModel[]>;

    existEntry(equipmentId: string | undefined, entryId: string | undefined):Promise<boolean>;
}

class EntryProxy implements IEntryProxy{
    baseUrl = process.env.REACT_APP_URL_BASE;

    ///////////////////////////Entry////////////////////////
    createOrSaveEntry = async (equipmentId: string, taskId: string | undefined, newEntry: EntryModel): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        newEntry = await progressiveHttpProxy.postAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + newEntry._uiId, "entry", newEntry, updateEntry);

        await storageService.updateArray(this.baseUrl + "entries/" + equipmentId, newEntry);

        return newEntry;
    }

    deleteEntry = async(equipmentId: string, taskId: string, entryId: string): Promise<EntryModel> => {
        taskId = taskId === undefined ? '-' : taskId;

        await progressiveHttpProxy.deleteAndUpdate(this.baseUrl + "entries/" + equipmentId + '/' + taskId + '/' + entryId, "entry", updateEntry);

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

        return await progressiveHttpProxy.getArrayOnlineFirst<EntryModel>(this.baseUrl + "entries/" + equipmentId, "entries", updateEntry);
    }

    existEntry = async (equipmentId: string | undefined, entryId: string | undefined):Promise<boolean> => {
        if (equipmentId === undefined || entryId === undefined){
            return false;
        }

        const allEntries = await this.fetchAllEntries(equipmentId);

        return allEntries.findIndex(entry => entry._uiId === entryId) !== -1;
    }
}

const entryProxy:IEntryProxy = new EntryProxy();
export default entryProxy;
