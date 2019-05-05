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

import { faPlusSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PropTypes from 'prop-types';

import * as moment from 'moment';
import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import jsonMessages from "./EquipmentHistoryTable.messages.json";
const messages: Messages = defineMessages(jsonMessages);

import './EquipmentHistoryTable.css';

import { Equipment, Entry, AgeAcquisitionType } from '../../types/Types';

type Props = {
    equipment: Equipment | undefined,
    onTaskChanged: React.MutableRefObject<(taskId: string) => void>,
    equipmentHistoryRefreshId: number,
    classNames?: string
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

const EquipmentHistoryTable = ({equipment, onTaskChanged, equipmentHistoryRefreshId, classNames}: Props) => {
    classNames = classNames ? classNames + ' historytasktable' : 'historytasktable';
    const equipmentId = equipment ? equipment._id : undefined;
    
    const modalHook = useEditModal<Entry | undefined>(undefined);

    const [entries, setEntries] = useState<Entry[]>([]);
    const [fetchingState, setFetchingState] = useState(FetchState.StandBy);

    useEffect(() => {
      fetchEntries();
    }, [equipmentId, equipmentHistoryRefreshId]);

    const fetchEntries = async () => {
        setFetchingState(FetchState.Fetching);

        try {
            let newEntries:Entry[] = [];
            if(equipmentId){
                newEntries = await EquipmentMonitorService.fetchAllEntries(equipmentId);
            }
            
            setEntries(newEntries);
            setFetchingState(FetchState.StandBy);
        } 
        catch (error) {
            setFetchingState(FetchState.Error);
        }
    };

    const onSavedEntry = (savedEntry: Entry) => {
        const newCurrentHistory = entries.filter(entry => entry._id !== savedEntry._id);
        newCurrentHistory.unshift(savedEntry);
        newCurrentHistory.sort((entryA, entryB) => entryA.date.getTime() - entryB.date.getTime());

        setEntries(newCurrentHistory);

        if(onTaskChanged && savedEntry.taskId){
            onTaskChanged.current(savedEntry.taskId);
        }
	}
	
	const onDeleteEntry = async(entry: Entry) => {  
        var newCurrentHistoryTask = entries.slice(0).filter(e => e._id !== entry._id);
        setEntries(newCurrentHistoryTask);

        if(onTaskChanged && entry.taskId){
            onTaskChanged.current(entry.taskId);
        }
    }

    const innerEntryCell = (entry:Entry, content: JSX.Element, classNames?: string) => {
        classNames = classNames === undefined ? '' : classNames;
		classNames += ' table-' + (entry.taskId === undefined ? "warning" : "white" );
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
            style: {width:"20%"},
			sortable: true
        },
        {
			name: 'name',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...messages.name} />
				</div>
			),
			cell: (content: any) => {
                const entryName = content.data.name;
				return innerEntryCell(content.data, <Fragment>{entryName}</Fragment>);
            },
            style: {width:"20%"},
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
                const equ = equipment;

                if (equ === undefined || equ.ageAcquisitionType !== AgeAcquisitionType.time){
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
            style: {width:"15%"},
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
            style: {width:"45%"},
			sortable: false
		}
	];
    
    return(
        <div className={classNames}>
            <span className="mb-2">
                <b><FormattedMessage {...messages.equipmentHistoryTitle} /></b>
                {equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEntry(equipment))}>
                    <FontAwesomeIcon icon={faPlusSquare} />
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
            
            {equipment && modalHook.data && <ModalEditEntry 
                equipment={equipment}
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

EquipmentHistoryTable.propTypes = {
    equipment: PropTypes.object,
    classNames: PropTypes.string,
    onEntryDeleted: PropTypes.object,
};

export default React.memo(EquipmentHistoryTable);