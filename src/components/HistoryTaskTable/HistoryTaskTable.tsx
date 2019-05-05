import  React, { useEffect, useState, Fragment } from 'react';
import { Button } from 'reactstrap';
import { 
    composeDecorators,
    withInMemorySortingContext,
    withFixedHeader,
    withHeaderControl,
  } from 'react-table-factory';
import { defineMessages, Messages, FormattedMessage, FormattedDate } from 'react-intl';
import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import Loading from '../Loading/Loading';

import { faCheckSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PropTypes from 'prop-types';

import * as moment from 'moment';
import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import jsonMessages from "./HistoryTaskTable.messages.json";
const messages: Messages = defineMessages(jsonMessages);

import './HistoryTaskTable.css';

import { Equipment, Task, Entry, AgeAcquisitionType } from '../../types/Types';

type Props = {
    equipment: Equipment | undefined,
    task: Task | undefined, 
    taskHistoryRefreshId: number,
    onHistoryChanged: (newEntries: Entry[])=>void,
    classNames: string
}

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader // should be last
)();

enum FetchState{
    StandBy,
    Fetching,
    Error
}

const HistoryTaskTable = ({equipment, task, taskHistoryRefreshId, onHistoryChanged, classNames}: Props) => {
    const equipmentId = equipment ? equipment._id : undefined;
    const taskId = task ? task._id : undefined;

    const modalHook = useEditModal<Entry | undefined>(undefined);

    const [entries, setEntries] = useState<Entry[]>([]);
    const [fetchingState, setFetchingState] = useState(FetchState.StandBy);

    useEffect(() => {
      fetchEntries();
    }, [taskId, taskHistoryRefreshId]);

    const fetchEntries = async () => {
        setFetchingState(FetchState.Fetching);

        try {
            let newEntries:Entry[] = [];
            if(equipmentId && taskId){
                newEntries = await EquipmentMonitorService.fetchEntries(equipmentId, taskId);
            }
            
            setEntries(newEntries);
            setFetchingState(FetchState.StandBy);
        } 
        catch (error) {
            setFetchingState(FetchState.Error);
        }
    };

    const changeEntries = (newEntries: Entry[]) => {
      setEntries(newEntries);
      if(onHistoryChanged){
        onHistoryChanged(newEntries);
      }
    };

    const onSavedEntry = (savedEntry: Entry) => {
        const newCurrentHistoryTask = entries.filter(entry => entry._id !== savedEntry._id);
        newCurrentHistoryTask.unshift(savedEntry);
        newCurrentHistoryTask.sort((entryA, entryB) => entryA.date.getTime() - entryB.date.getTime());

        changeEntries(newCurrentHistoryTask);
	}
	
	const onDeleteEntry = async(entry: Entry) => {  
        var newCurrentHistoryTask = entries.slice(0).filter(e => e._id !== entry._id);
        changeEntries(newCurrentHistoryTask);
    }

    const innerEntryCell = (entry:Entry, content: JSX.Element, classNames?: string) => {
		classNames = classNames === undefined ? '' : classNames;
		return (
			<div onClick={() => modalHook.displayData(entry)} className={classNames + ' innerTd clickable'} >
				{content}
			</div>
		);
	}

    const columns = [
		{
			name: 'date',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...messages.ackDate} />
				</div>
			),
			cell: (content: any) => {
                const entryDate = new Date(content.data.date);
				return innerEntryCell(content.data, <FormattedDate value={entryDate} />);
            },
            style: {width:"25%"},
			sortable: true
		},
		{
			name: 'age',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...messages.age} />
				</div>
			),
			cell: (content: any) => {
                const entry:Entry = content.data;
                const equ = equipment as Equipment;

                if (equ.ageAcquisitionType !== AgeAcquisitionType.time){
                    return innerEntryCell(entry, <Fragment>{entry.age === -1?"":entry.age + 'h'}</Fragment>);
                }
                else{
                    const diff = moment.duration(entry.date.getTime() - equ.installation.getTime());
                    const year = diff.years();
                    const month = diff.months();
                    const day = diff.days();
                    return innerEntryCell(entry, <Fragment>
                        {diff.years() > 0 && <FormattedMessage {... messages.yearperiod} values={{year}}/>}{' '}
                        {diff.months() > 0 && <FormattedMessage {... messages.monthperiod} values={{month}}/>}{' '}
                        {diff.days() > 0 && <FormattedMessage {... messages.dayperiod} values={{day}}/>}
                    </Fragment>);
                }
            },
            style: {width:"25%"},
			sortable: true
		},
		{
			name: 'remarks',
			header: () => (
				<div className={'text-center innerTdHead'}>
					<FormattedMessage {...messages.remarks}/>
				</div>
			),
			cell: (content: any) => {
                const entry:Entry = content.data;
                var remarks = entry.remarks.replace(/\n/g, '<br />');
                var shortenRemarks = shorten(remarks);

				return innerEntryCell(entry, <div dangerouslySetInnerHTML={{ __html: shortenRemarks }}/>);
            },
            style: {width:"50%"},
			sortable: false
		}
	];
    
    return(
        <div className={classNames + ' historytasktable'}>
            <span className="mb-2">
                <b><FormattedMessage {...messages.taskHistoryTitle} /></b>
                {task && <Button aria-label="Add" color="success" size="sm" className="float-right mb-2" onClick={() => {
                    modalHook.displayData(createDefaultEntry(equipment, task));
                }}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                </Button>}
            </span>
            {fetchingState === FetchState.Error && <div><FontAwesomeIcon icon={faExclamationTriangle} color="red"/><FormattedMessage {...messages.errorFetching} /></div>}
            {fetchingState === FetchState.Fetching && <Loading/>}
            {fetchingState === FetchState.StandBy && 
            <Table
                data={entries}
                className="default-theme"
                defaultSortParameter="date"
                defaultSortDirection="desc"
                columns={columns}
            />
            }
            
            {equipment && task && modalHook.data && <ModalEditEntry 
                equipment={equipment}
                task={task}
                entry={modalHook.data}
                saveEntry={onSavedEntry} 
                deleteEntry={onDeleteEntry}
                visible={modalHook.editModalVisibility}
                toggle={modalHook.toggleModal}
                className='modal-dialog-centered'
            />}
        </div>
    );
}

HistoryTaskTable.propTypes = {
    equipment: PropTypes.object,
    task: PropTypes.object,
    classNames: PropTypes.string,
    onHistoryChanged: PropTypes.func,
};

export default React.memo(HistoryTaskTable);