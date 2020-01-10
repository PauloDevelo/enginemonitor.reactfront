/* eslint-disable max-len */
import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import * as moment from 'moment';

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

import entryProxy from '../../services/EntryProxy';

import useEditModal from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import './HistoryTaskTable.css';

import {
  // eslint-disable-next-line no-unused-vars
  EquipmentModel, TaskModel, EntryModel, AgeAcquisitionType,
} from '../../types/Types';

import useFetcher from '../../hooks/Fetcher';

import jsonMessages from './HistoryTaskTable.messages.json';

const messages = defineMessages(jsonMessages);

type Props = {
    equipment: EquipmentModel | undefined,
    task: TaskModel | undefined,
    taskHistoryRefreshId: number,
    onHistoryChanged: (newEntries: EntryModel[])=>void,
    classNames: string
}

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

const HistoryTaskTable = ({
  equipment, task, taskHistoryRefreshId, onHistoryChanged, classNames,
}: Props) => {
  const equipmentId = equipment ? equipment._uiId : undefined;
  const taskId = task ? task._uiId : undefined;

  const modalHook = useEditModal<EntryModel | undefined>(undefined);
  const [entries, setEntries] = useState<EntryModel[]>([]);

  const {
    data: fetchedEntries, error, isLoading, reloadRef,
  } = useFetcher({ fetchPromise: entryProxy.fetchEntries, fetchProps: { equipmentId, taskId }, cancellationMsg: 'Cancellation of task history fetching' });

  useEffect(() => {
    if (taskHistoryRefreshId !== 0) {
      reloadRef.current();
    }
  }, [taskHistoryRefreshId, reloadRef]);

  useEffect(() => {
    setEntries(fetchedEntries || []);
  }, [fetchedEntries]);

  const changeEntries = (newEntries: EntryModel[]) => {
    setEntries(newEntries);
    if (onHistoryChanged) {
      onHistoryChanged(newEntries);
    }
  };

  const onSavedEntry = (savedEntry: EntryModel) => {
    const newCurrentHistoryTask = entries.filter((entry) => entry._uiId !== savedEntry._uiId);
    newCurrentHistoryTask.unshift(savedEntry);
    newCurrentHistoryTask.sort((entryA, entryB) => entryA.date.getTime() - entryB.date.getTime());

    changeEntries(newCurrentHistoryTask);
  };

  const onDeleteEntry = async (entry: EntryModel) => {
    const newCurrentHistoryTask = entries.slice(0).filter((e) => e._uiId !== entry._uiId);
    changeEntries(newCurrentHistoryTask);
  };

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
        const entry : EntryModel = content.data;
        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.ack === false ? 'warning' : 'white'}`}>
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
        <div className="innerTdHead"><FormattedMessage {...messages.age} /></div>
      ),
      cell: (content: any) => {
        const entry:EntryModel = content.data;
        if (equipment == null) {
          return <div />;
        }

        if (equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
          return (
            <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.ack === false ? 'warning' : 'white'}`}>
              <>{entry.age === -1 ? '' : `${entry.age}h`}</>
            </ClickableCell>
          );
        }

        const diff = moment.duration(entry.date.getTime() - equipment.installation.getTime());
        const year = diff.years();
        const month = diff.months();
        const day = diff.days();

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <>
              {diff.years() > 0 && <FormattedMessage {... messages.yearperiod} values={{ year }} />}
              {' '}
              {diff.months() > 0 && <FormattedMessage {... messages.monthperiod} values={{ month }} />}
              {' '}
              {diff.days() > 0 && <FormattedMessage {... messages.dayperiod} values={{ day }} />}
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
        const entry:EntryModel = content.data;
        const remarks = entry.remarks.replace(/\n/g, '<br />');
        const shortenRemarks = shorten(remarks);

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.ack === false ? 'warning' : 'white'}`}>
            <div dangerouslySetInnerHTML={{ __html: shortenRemarks }} />
          </ClickableCell>
        );
      },
      style: { width: '50%' },
      sortable: false,
    },
  ];

  return (
    <div className={`${classNames} historytasktable`}>
      <span className="mb-2">
        <b><FormattedMessage {...messages.taskHistoryTitle} /></b>
        {equipment && task && (
          <Button aria-label="Add" color="success" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEntry(equipment, task))}>
            <FontAwesomeIcon icon={faCheckSquare} />
          </Button>
        )}
      </span>
      {error && (
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle} color="red" />
          <FormattedMessage {...messages.errorFetching} />
        </div>
      )}
      {isLoading && <Loading />}
      {error === undefined && isLoading === false
            && (
            <Table
              data={entries}
              className="default-theme"
              defaultSortParameter="date"
              defaultSortDirection="desc"
              columns={columns}
            />
            )}

      {equipment && task && modalHook.data && (
      <ModalEditEntry
        equipment={equipment}
        task={task}
        entry={modalHook.data}
        saveEntry={onSavedEntry}
        deleteEntry={onDeleteEntry}
        visible={modalHook.editModalVisibility}
        toggle={modalHook.toggleModal}
        className="modal-dialog-centered"
      />
      )}
    </div>
  );
};

export default React.memo(HistoryTaskTable);
