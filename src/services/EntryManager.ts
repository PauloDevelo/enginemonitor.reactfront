// eslint-disable-next-line no-unused-vars
import { CancelTokenSource } from 'axios';
import _ from 'lodash';
import log from 'loglevel';
import equipmentManager from './EquipmentManager';
import taskManager from './TaskManager';

// eslint-disable-next-line no-unused-vars
import { EntryModel, EquipmentModel } from '../types/Types';

import httpProxy from './HttpProxy';

export type CurrentEntryListener = (entry: EntryModel|undefined) => void;
export type EntriesListener = (entries: EntryModel[]) => void;

export interface IEntryManager{
    getEquipmentEntries(): EntryModel[];
    getTaskEntries(): EntryModel[];
    areEntriesLoading(): boolean;

    getCurrentEntry(): EntryModel | undefined;
    setCurrentEntry(entry: EntryModel | undefined): void;
    isCurrentEntryChanging(): boolean;

    onEntryDeleted(entryToDelete: EntryModel): void;
    onEntrySaved(entrySaved: EntryModel): void;

    registerOnCurrentEntryChanged(listener: CurrentEntryListener):void;
    unregisterOnCurrentEntryChanged(listenerToRemove: CurrentEntryListener):void;

    registerOnEquipmentEntriesChanged(listener: EntriesListener):void;
    unregisterOnEquipmentEntriesChanged(listenerToRemove: EntriesListener):void;
}

class EntryManager implements IEntryManager {
    private cancelFetchToken: CancelTokenSource | undefined = undefined;

    private cancelFetch: (() => void) | undefined = undefined;

    private currentEntryListeners: CurrentEntryListener[] = [];

    private equipmentEntriesListeners: EntriesListener[] = [];

    private entries: EntryModel[] = [];

    private currentEntry: EntryModel|undefined = undefined;

    private isCurrentEntryChangingFlag: boolean = false;

    private areEntriesLoadingFlag: boolean = false;

    constructor() {
      equipmentManager.registerOnCurrentEquipmentChanged(this.onCurrentEquipmentChanged);
    }

    // eslint-disable-next-line no-unused-vars
    private onCurrentEquipmentChanged = async (currentEquipment: EquipmentModel | undefined) => {
      this.isCurrentEntryChangingFlag = true;
      this.areEntriesLoadingFlag = true;

      if (currentEquipment === undefined) {
        this.onEntriesChanged([]);
        return;
      }


      const { default: entryProxy } = await import('./EntryProxy');

      if (this.cancelFetch !== undefined) {
        this.cancelFetch();
      }

      this.cancelFetchToken = httpProxy.createCancelTokenSource();
      this.cancelFetch = () => {
        if (this.cancelFetchToken !== undefined) { this.cancelFetchToken.cancel(`Cancel fetching entries of equipment ${currentEquipment.name}`); }
      };

      try {
        const entries = await entryProxy.fetchAllEntries({ equipmentId: currentEquipment._uiId, cancelToken: this.cancelFetchToken.token });
        this.cancelFetch = undefined;

        this.onEntriesChanged(entries);
      } catch (error) {
        log.warn(error.message);
        this.areEntriesLoadingFlag = false;
      }
    }

    getEquipmentEntries = (): EntryModel[] => this.entries.concat([])

    getTaskEntries = (): EntryModel[] => {
      const currentTask = taskManager.getCurrentTask();
      if (currentTask === undefined) {
        return [];
      }

      return this.entries.filter((entry) => entry.taskUiId === currentTask._uiId);
    }

    areEntriesLoading = (): boolean => this.areEntriesLoadingFlag

    getCurrentEntry = (): EntryModel | undefined => this.currentEntry

    setCurrentEntry = (entry: EntryModel | undefined) => {
      this.currentEntry = entry;
      this.isCurrentEntryChangingFlag = false;
      this.currentEntryListeners.map((listener) => listener(this.currentEntry));
    }

    isCurrentEntryChanging = () => this.isCurrentEntryChangingFlag

    private onEntriesChanged = (entries: EntryModel[], newCurrentEntry?: EntryModel): void => {
      this.entries = _.orderBy(entries, (entry: EntryModel) => entry.date, 'asc');

      this.areEntriesLoadingFlag = false;

      this.equipmentEntriesListeners.map((listener) => listener(this.entries));

      if (newCurrentEntry !== undefined) {
        this.setCurrentEntry(newCurrentEntry);
      } else if (this.getCurrentEntry() === undefined) {
        this.setCurrentEntry(this.entries.length > 0 ? this.entries[0] : undefined);
      } else {
        const currentEntryIndex = this.entries.findIndex((eq) => eq._uiId === this.getCurrentEntry()?._uiId);
        if (currentEntryIndex === -1) {
          this.setCurrentEntry(this.entries.length > 0 ? this.entries[0] : undefined);
        } else {
          this.setCurrentEntry(this.entries[currentEntryIndex]);
        }
      }
    }

    onEntryDeleted = (entryToDelete: EntryModel): void => {
      if (entryToDelete._uiId === this.currentEntry?._uiId) {
        this.isCurrentEntryChangingFlag = true;
      }

      const newEntryList = this.entries.filter((entry) => entry._uiId !== entryToDelete._uiId);
      this.onEntriesChanged(newEntryList);
      taskManager.refreshTasks();
    }

    onEntrySaved = (entrySaved: EntryModel): void => {
      const index = this.entries.findIndex((entry) => entry._uiId === entrySaved._uiId);

      const entryToAddOrUpdate = { ...entrySaved };
      if (index === -1) {
        this.entries.push(entryToAddOrUpdate);
      } else {
        this.entries[index] = entryToAddOrUpdate;
      }

      this.onEntriesChanged(this.entries.concat([]), entryToAddOrUpdate);
      taskManager.refreshTasks();
    }

    registerOnCurrentEntryChanged = (listener: CurrentEntryListener):void => {
      this.currentEntryListeners.push(listener);
    }

    unregisterOnCurrentEntryChanged = (listenerToRemove: CurrentEntryListener):void => {
      this.currentEntryListeners = this.currentEntryListeners.filter((listener) => listener !== listenerToRemove);
    }

    registerOnEquipmentEntriesChanged = (listener: EntriesListener):void => {
      this.equipmentEntriesListeners.push(listener);
    }

    unregisterOnEquipmentEntriesChanged = (listenerToRemove: EntriesListener):void => {
      this.equipmentEntriesListeners = this.equipmentEntriesListeners.filter((listener) => listener !== listenerToRemove);
    }
}

const entryManager:IEntryManager = new EntryManager();
export default entryManager;
