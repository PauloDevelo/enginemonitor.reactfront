import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import { composeDecorators } from '../react-table-factory/table.js';
import { withInMemorySortingContext } from '../react-table-factory/withSortingContext.js';
import { withHeaderControl } from '../react-table-factory/withHeaderControl.js';
import { withFixedHeader } from '../react-table-factory/withFixedHeader.js';

import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import Loading from '../Loading/Loading';
import ClickableCell from '../Table/ClickableCell';

import useEditModal from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import './EquipmentHistoryTable.css';

import {
  // eslint-disable-next-line no-unused-vars
  EquipmentModel, EntryModel, AgeAcquisitionType, TaskModel,
} from '../../types/Types';

import entryManager from '../../services/EntryManager';
import taskManager from '../../services/TaskManager';
import equipmentManager from '../../services/EquipmentManager';

import jsonMessages from './EquipmentHistoryTable.messages.json';

const messages = defineMessages(jsonMessages);

type Props = {
    classNames?: string
}

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

const EquipmentHistoryTable = ({ classNames }: Props) => {
  const classNamesStr = classNames ? `${classNames} historytasktable` : 'historytasktable';

  const [equipment, setEquipment] = useState<EquipmentModel | undefined>(equipmentManager.getCurrentEquipment());
  const [parentTask, setParentTask] = useState<TaskModel | undefined>(undefined);
  const modalHook = useEditModal<EntryModel | undefined>(undefined);
  const [entries, setEntries] = useState<EntryModel[]>(entryManager.getEquipmentEntries());

  useEffect(() => {
    entryManager.registerOnEquipmentEntriesChanged(setEntries);
    equipmentManager.registerOnCurrentEquipmentChanged(setEquipment);

    return () => {
      entryManager.unregisterOnEquipmentEntriesChanged(setEntries);
      equipmentManager.unregisterOnCurrentEquipmentChanged(setEquipment);
    };
  }, []);

  const displayEntry = useCallback(async (entry:EntryModel) => {
    if (entry.taskUiId !== undefined) {
      const newParentTask = taskManager.getTask(entry.taskUiId);
      setParentTask(newParentTask);

      taskManager.setCurrentTask(newParentTask);
    } else {
      setParentTask(undefined);
    }

    modalHook.displayData(entry);
  }, [modalHook]);

  const columns = [
    {
      name: 'date',
      header: () => (
        <div className="innerTdHead">
          <FormattedMessage {...messages.ackDate} />
        </div>
      ),
      cell: (content: any) => {
        const entry: EntryModel = content.data;
        return (
          <ClickableCell data={content.data} onDisplayData={displayEntry} classNames={`table-${entry.taskUiId === undefined ? 'warning' : 'white'}`}>
            <FormattedDate value={entry.date} />
          </ClickableCell>
        );
      },
      style: { width: '20%' },
      sortable: true,
    },
    {
      name: 'name',
      header: () => (
        <div className="innerTdHead">
          <FormattedMessage {...messages.name} />
        </div>
      ),
      cell: (content: any) => {
        const entry: EntryModel = content.data;
        const entryName = entry.name;
        return (
          <ClickableCell data={content.data} onDisplayData={displayEntry} classNames={`table-${entry.taskUiId === undefined ? 'warning' : 'white'}`}>
            <>{entryName}</>
          </ClickableCell>
        );
      },
      style: { width: '20%' },
      sortable: true,
    },
    {
      name: 'age',
      header: () => (
        <div className="innerTdHead">
          <FormattedMessage {...messages.age} />
        </div>
      ),
      cell: (content: any) => {
        const entry:EntryModel = content.data;
        if (equipment === undefined || equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
          return (
            <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.taskUiId === undefined ? 'warning' : 'white'}`}>
              <>{entry.age === -1 ? '' : `${entry.age}h`}</>
            </ClickableCell>
          );
        }

        const diff = moment.duration(entry.date.getTime() - equipment.installation.getTime());
        const year = diff.years();
        const month = diff.months();
        const day = diff.days();
        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.taskUiId === undefined ? 'warning' : 'white'}`}>
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
      style: { width: '15%' },
      sortable: true,
    },
    {
      name: 'remarks',
      header: () => (
        <div className="text-center innerTdHead">
          <FormattedMessage {...messages.remarks} />
        </div>
      ),
      cell: (content: any) => {
        const entry:EntryModel = content.data;
        const remarks = entry.remarks.replace(/\n/g, '<br />');
        const shortenRemarks = shorten(remarks);

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} classNames={`table-${entry.taskUiId === undefined ? 'warning' : 'white'}`}>
            <div dangerouslySetInnerHTML={{ __html: shortenRemarks }} />
          </ClickableCell>
        );
      },
      style: { width: '45%' },
      sortable: false,
    },
  ];

  return (
    <div className={classNamesStr}>
      <span className="mb-2">
        <b><FormattedMessage {...messages.equipmentHistoryTitle} /></b>
        {equipment && (
          <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEntry(equipment, undefined))} aria-label="Add">
            <FontAwesomeIcon icon={faPlusSquare} />
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

      {equipment && modalHook.data && (
      <ModalEditEntry
        equipment={equipment}
        entry={modalHook.data}
        task={parentTask}
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

export default React.memo(EquipmentHistoryTable);
