/* eslint-disable react/no-danger */
/* eslint-disable max-len */
// eslint-disable-next-line no-use-before-define
import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import * as moment from 'moment';
import _ from 'lodash';

import classnames from 'classnames';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { faCheckSquare, faExclamationTriangle, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import Loading from '../Loading/Loading';
import ClickableCell from '../Table/ClickableCell';

import { composeDecorators } from '../react-table-factory/table.js';
import { withInMemorySortingContext } from '../react-table-factory/withSortingContext.js';
import { withHeaderControl } from '../react-table-factory/withHeaderControl.js';
import { withFixedHeader } from '../react-table-factory/withFixedHeader.js';

import useEditModal from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import './HistoryTaskTable.css';

import {
  // eslint-disable-next-line no-unused-vars
  TaskModel, EntryModel, AgeAcquisitionType,
} from '../../types/Types';

import jsonMessages from './HistoryTaskTable.messages.json';

import entryManager from '../../services/EntryManager';
import taskManager from '../../services/TaskManager';
import equipmentManager from '../../services/EquipmentManager';

import imageProxy from '../../services/ImageProxy';

const messages = defineMessages(jsonMessages);

type Props = {
    // eslint-disable-next-line react/require-default-props
    className?: string
}

interface DisplayableEntry extends EntryModel {
  timeFromPreviousEntry: number | undefined;
  durationFromPreviousEntry: moment.Duration | undefined;
  isLate: boolean;
  nbImage: number;
}

const convertEntryModelToDisplayableEntry = async (entry: EntryModel, index: number, entries: EntryModel[]): Promise<DisplayableEntry> => {
  const equipment = equipmentManager.getCurrentEquipment();
  const task = taskManager.getCurrentTask();

  const previousAckEntryIndex = index > 0 ? _.findLastIndex(entries, (e: EntryModel) => e.ack, index - 1) : -1;

  let timeFromPreviousEntry: number | undefined;
  if (equipment && task && equipment.ageAcquisitionType !== AgeAcquisitionType.time && task.usagePeriodInHour) {
    if (previousAckEntryIndex === -1) {
      timeFromPreviousEntry = entry.age;
    } else {
      timeFromPreviousEntry = entry.age - entries[previousAckEntryIndex].age;
    }
  }

  const previousEntryDate = previousAckEntryIndex === -1 ? (equipment && equipment.installation) : entries[previousAckEntryIndex].date;
  const durationFromPreviousEntry = previousEntryDate ? moment.duration(entry.date.getTime() - previousEntryDate.getTime()) : undefined;

  const isLate = task !== undefined && entry.ack
  && ((timeFromPreviousEntry !== undefined && task.usagePeriodInHour !== undefined && timeFromPreviousEntry > task.usagePeriodInHour)
  || (durationFromPreviousEntry !== undefined && durationFromPreviousEntry.asMonths() > task.periodInMonth));

  const nbImage = (await imageProxy.fetchImages({ parentUiId: entry._uiId, checkStorageFirst: true })).length;

  return {
    ...entry, timeFromPreviousEntry, durationFromPreviousEntry, isLate, nbImage,
  };
};

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

const HistoryTaskTable = ({ className }: Props) => {
  const modalHook = useEditModal<EntryModel | undefined>(undefined);
  const [entries, setEntries] = useState<DisplayableEntry[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const onEntriesChanged = async (entities: EntryModel[] | TaskModel | undefined) => {
      setLoading(true);
      const promises = entryManager.getTaskEntries().map(convertEntryModelToDisplayableEntry);
      const displayableEntries = await Promise.all(promises);
      setEntries(displayableEntries);
      setLoading(false);
    };

    taskManager.registerOnCurrentTaskChanged(onEntriesChanged);
    entryManager.registerOnEquipmentEntriesChanged(onEntriesChanged);

    onEntriesChanged(undefined);

    return () => {
      taskManager.unregisterOnCurrentTaskChanged(onEntriesChanged);
      entryManager.unregisterOnEquipmentEntriesChanged(onEntriesChanged);
    };
  }, []);

  const displayEntry = useCallback((entry:EntryModel) => {
    modalHook.displayData(entry);
  }, [modalHook]);

  const columns = [
    {
      name: 'date',
      header: () => (
        <div className="innerTdHead"><FormattedMessage {...messages.ackDate} /></div>
      ),
      cell: (content: any) => {
        const entry : DisplayableEntry = content.data;

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <FormattedDate value={entry.date} />
          </ClickableCell>
        );
      },
      style: { width: '20%' },
      sortable: true,
    },
    {
      name: 'age',
      header: () => (
        <div className="innerTdHead"><FormattedMessage {...messages.doneAfter} /></div>
      ),
      cell: (content: any) => {
        const entry:DisplayableEntry = content.data;
        const equipment = equipmentManager.getCurrentEquipment();
        const task = taskManager.getCurrentTask();
        if (equipment === undefined || task === undefined) {
          return <div />;
        }

        if (entry.timeFromPreviousEntry !== undefined) {
          return (
            <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
              <>
                {`${entry.timeFromPreviousEntry}h `}
                {entry.isLate && <FontAwesomeIcon icon={faExclamationTriangle} color="grey" /> }
              </>
            </ClickableCell>
          );
        }

        if (entry.durationFromPreviousEntry === undefined) {
          return <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`} />;
        }

        const year = entry.durationFromPreviousEntry.years();
        const month = entry.durationFromPreviousEntry.months();
        const day = entry.durationFromPreviousEntry.days();

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <>
              {year > 0 && <FormattedMessage {... messages.yearperiod} values={{ year }} />}
              {' '}
              {month > 0 && <FormattedMessage {... messages.monthperiod} values={{ month }} />}
              {' '}
              {day > 0 && <FormattedMessage {... messages.dayperiod} values={{ day }} />}
              {' '}
              {entry.isLate && <FontAwesomeIcon icon={faExclamationTriangle} color="grey" />}
            </>
          </ClickableCell>
        );
      },
      style: { width: '20%' },
      sortable: false,
    },
    {
      name: 'pic',
      header: () => (
        <div className="innerTdHead"><FontAwesomeIcon icon={faCamera} color="black" /></div>
      ),
      cell: (content: any) => {
        const entry:DisplayableEntry = content.data;

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <>
              {entry.nbImage > 0 && <FontAwesomeIcon icon={faCamera} color="grey" /> }
            </>
          </ClickableCell>
        );
      },
      style: { width: '10%' },
      sortable: false,
    },
    {
      name: 'remarks',
      header: () => (
        <div className="text-center innerTdHead"><FormattedMessage {...messages.remarks} /></div>
      ),
      cell: (content: any) => {
        const entry:DisplayableEntry = content.data;
        const remarks = entry.remarks.replace(/\n/g, '<br />');
        const shortenRemarks = shorten(remarks);

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <div dangerouslySetInnerHTML={{ __html: shortenRemarks }} />
          </ClickableCell>
        );
      },
      style: { width: '50%' },
      sortable: false,
    },
  ];

  return (
    <div className={classnames(className, 'historytasktable')}>
      <span className="mb-2">
        <b><FormattedMessage {...messages.taskHistoryTitle} /></b>
        {equipmentManager.getCurrentEquipment() && taskManager.getCurrentTask() && (
          <Button aria-label="Add" color="success" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEntry(equipmentManager.getCurrentEquipment()!, taskManager.getCurrentTask()))}>
            <FontAwesomeIcon icon={faCheckSquare} />
          </Button>
        )}
      </span>
      {(taskManager.isCurrentTaskChanging() || entryManager.areEntriesLoading() || isLoading) && <Loading />}
      {taskManager.isCurrentTaskChanging() === false && entryManager.areEntriesLoading() === false && isLoading === false
            && (
            <Table
              data={entries}
              className="default-theme"
              defaultSortParameter="date"
              defaultSortDirection="desc"
              columns={columns}
            />
            )}

      {equipmentManager.getCurrentEquipment() && taskManager.getCurrentTask() && modalHook.data && (
      <ModalEditEntry
        equipment={equipmentManager.getCurrentEquipment()!}
        task={taskManager.getCurrentTask()}
        entry={modalHook.data}
        saveEntry={entryManager.onEntrySaved}
        deleteEntry={entryManager.onEntryDeleted}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
      )}
    </div>
  );
};

export default React.memo(HistoryTaskTable);
