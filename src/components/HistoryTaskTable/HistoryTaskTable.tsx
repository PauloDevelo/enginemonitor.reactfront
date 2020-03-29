/* eslint-disable max-len */
import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import * as moment from 'moment';
import _ from 'lodash';

import classnames from 'classnames';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { faCheckSquare, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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

const messages = defineMessages(jsonMessages);

type Props = {
    className?: string
}

interface DisplayableEntry extends EntryModel {
  timeFromPreviousEntry: number | undefined;
  durationFromPreviousEntry: moment.Duration | undefined;
  isLate: boolean;
}

const convertEntryModelToDisplayableEntry = (entry: EntryModel, index: number, entries: EntryModel[]): DisplayableEntry => {
  const equipment = equipmentManager.getCurrentEquipment();
  const task = taskManager.getCurrentTask();

  const previousAckEntryIndex = index > 0 ? _.findLastIndex(entries, (e: EntryModel) => e.ack, index - 1) : -1;

  let timeFromPreviousEntry: number | undefined;
  if (equipment && equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
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

  return {
    ...entry, timeFromPreviousEntry, durationFromPreviousEntry, isLate,
  };
};

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

const HistoryTaskTable = ({ className }: Props) => {
  const modalHook = useEditModal<EntryModel | undefined>(undefined);
  const [entries, setEntries] = useState<EntryModel[]>(entryManager.getTaskEntries().map(convertEntryModelToDisplayableEntry));

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const onEntriesChanged = (_: EntryModel[] | TaskModel | undefined) => {
      setEntries(entryManager.getTaskEntries().map(convertEntryModelToDisplayableEntry));
    };

    taskManager.registerOnCurrentTaskChanged(onEntriesChanged);
    entryManager.registerOnEquipmentEntriesChanged(onEntriesChanged);

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
      style: { width: '25%' },
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
        if (equipment == null) {
          return <div />;
        }

        if (equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
          return (
            <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
              <>{entry.timeFromPreviousEntry !== undefined ? `${entry.timeFromPreviousEntry}h ` : ''}</>
              {entry.isLate ? <FontAwesomeIcon icon={faExclamationTriangle} color="grey" /> : <></>}
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
            </>
          </ClickableCell>
        );
      },
      style: { width: '25%' },
      sortable: true,
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
      {entryManager.areEntriesLoading() && <Loading />}
      {entryManager.areEntriesLoading() === false
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
