/* eslint-disable max-len */
import React, {
  useEffect, useState, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import * as moment from 'moment';

import classnames from 'classnames';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
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

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader, // should be last
)();

const HistoryTaskTable = ({ className }: Props) => {
  const modalHook = useEditModal<EntryModel | undefined>(undefined);
  const [entries, setEntries] = useState<EntryModel[]>(entryManager.getTaskEntries());

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const onEntriesChanged = (_: EntryModel[] | TaskModel | undefined) => {
      setEntries(entryManager.getTaskEntries());
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
        const entry : EntryModel = content.data;

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
        <div className="innerTdHead"><FormattedMessage {...messages.age} /></div>
      ),
      cell: (content: any) => {
        const entry:EntryModel = content.data;
        const equipment = equipmentManager.getCurrentEquipment();
        if (equipment == null) {
          return <div />;
        }

        if (equipment.ageAcquisitionType !== AgeAcquisitionType.time) {
          return (
            <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
              <>{entry.age === -1 ? '' : `${entry.age}h`}</>
            </ClickableCell>
          );
        }

        const diff = moment.duration(entry.date.getTime() - equipment.installation.getTime());
        const year = diff.years();
        const month = diff.months();
        const day = diff.days();

        return (
          <ClickableCell data={entry} onDisplayData={displayEntry} className={`table-${entry.ack === false ? 'warning' : 'white'}`}>
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
