import  React, { useEffect, useState, Fragment, useCallback } from 'react';
import { Button } from 'reactstrap';

import { composeDecorators } from '../react-table-factory/table';
import { withInMemorySortingContext } from '../react-table-factory/withSortingContext';
import { withHeaderControl } from '../react-table-factory/withHeaderControl';
import { withFixedHeader } from '../react-table-factory/withFixedHeader';

import { defineMessages, FormattedMessage, FormattedDate } from 'react-intl';
import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import Loading from '../Loading/Loading';
import ClickableCell from '../Table/ClickableCell';

import { useFetcher} from '../../hooks/Fetcher';

import { faPlusSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as moment from 'moment';
import entryProxy from '../../services/EntryProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import { shorten } from '../../helpers/TaskHelper';
import { createDefaultEntry } from '../../helpers/EntryHelper';

import './EquipmentHistoryTable.css';

import { EquipmentModel, EntryModel, AgeAcquisitionType } from '../../types/Types';

import jsonMessages from "./EquipmentHistoryTable.messages.json";
const messages = defineMessages(jsonMessages);

type Props = {
    equipment: EquipmentModel | undefined,
    onTaskChanged: (taskId: string) => void,
    equipmentHistoryRefreshId: number,
    classNames?: string
}

const Table = composeDecorators(
  withHeaderControl,
  withInMemorySortingContext(),
  withFixedHeader // should be last
)();

const EquipmentHistoryTable = ({equipment, onTaskChanged, equipmentHistoryRefreshId, classNames}: Props) => {
    classNames = classNames ? classNames + ' historytasktable' : 'historytasktable';

    const equipmentId = equipment ? equipment._uiId : undefined;
    
    const modalHook = useEditModal<EntryModel | undefined>(undefined);
    const [entries, setEntries] = useState<EntryModel[]>([]);
    const {data: fetchedEntries, error, isLoading, reloadRef} = useFetcher({ fetchPromise: entryProxy.fetchAllEntries, fetchProps: {equipmentId}, cancellationMsg:"Cancellation of equipment history fetching"});

    useEffect(() => {
        if(equipmentHistoryRefreshId !== 0){
            reloadRef.current();
        }
    }, [equipmentHistoryRefreshId, reloadRef]);

    useEffect(() => {
        setEntries(fetchedEntries?fetchedEntries:[]);
    }, [fetchedEntries]);

    const onSavedEntry = (savedEntry: EntryModel) => {
        const newCurrentHistory = entries.filter(entry => entry._uiId !== savedEntry._uiId);
        newCurrentHistory.unshift(savedEntry);
        newCurrentHistory.sort((entryA, entryB) => entryA.date.getTime() - entryB.date.getTime());

        setEntries(newCurrentHistory);

        if(onTaskChanged && savedEntry.taskUiId){
            onTaskChanged(savedEntry.taskUiId);
        }
	}
	
	const onDeleteEntry = async(entry: EntryModel) => {  
        var newCurrentHistoryTask = entries.slice(0).filter(e => e._uiId !== entry._uiId);
        setEntries(newCurrentHistoryTask);

        if(onTaskChanged && entry.taskUiId){
            onTaskChanged(entry.taskUiId);
        }
    }

    const displayEntry = useCallback((entry:EntryModel) => {
        modalHook.displayData(entry)
    }, [modalHook]);

    const columns = [
		{
			name: 'date',
			header: () => (
				<div className={'innerTdHead'}>
					<FormattedMessage {...messages.ackDate} />
				</div>
			),
			cell: (content: any) => {
                const entry: EntryModel = content.data;
                return (<ClickableCell data={content.data} onDisplayData={displayEntry} classNames={'table-' + (entry.taskUiId === undefined ? "warning" : "white" )}>
                            <FormattedDate value={entry.date} />
                        </ClickableCell>);
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
                const entry: EntryModel = content.data;
                const entryName = entry.name;
                return (<ClickableCell data={content.data} onDisplayData={displayEntry} classNames={'table-' + (entry.taskUiId === undefined ? "warning" : "white" )}>
                            <Fragment>{entryName}</Fragment>
                        </ClickableCell>);
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
                const entry:EntryModel = content.data;
                const equ = equipment;

                if (equ === undefined || equ.ageAcquisitionType !== AgeAcquisitionType.time){
                    return (<ClickableCell data={entry} onDisplayData={displayEntry} classNames={'table-' + (entry.taskUiId === undefined ? "warning" : "white" )}>
                            <Fragment>{entry.age === -1?"":entry.age + 'h'}</Fragment>
                        </ClickableCell>);
                }
                else{
                    const diff = moment.duration(entry.date.getTime() - equ.installation.getTime());
                    const year = diff.years();
                    const month = diff.months();
                    const day = diff.days();
                    return (<ClickableCell data={entry} onDisplayData={displayEntry} classNames={'table-' + (entry.taskUiId === undefined ? "warning" : "white" )}>
                            <Fragment>
                                {diff.years() > 0 && <FormattedMessage {... messages.yearperiod} values={{year}}/>}{' '}
                                {diff.months() > 0 && <FormattedMessage {... messages.monthperiod} values={{month}}/>}{' '}
                                {diff.days() > 0 && <FormattedMessage {... messages.dayperiod} values={{day}}/>}
                            </Fragment>
                        </ClickableCell>);
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
                const entry:EntryModel = content.data;
                var remarks = entry.remarks.replace(/\n/g, '<br />');
                var shortenRemarks = shorten(remarks);

                return (<ClickableCell data={entry} onDisplayData={displayEntry} classNames={'table-' + (entry.taskUiId === undefined ? "warning" : "white" )}>
                            <div dangerouslySetInnerHTML={{ __html: shortenRemarks }}/>
                        </ClickableCell>);
            },
            style: {width:"45%"},
			sortable: false
		}
    ];
    
    return(
        <div className={classNames}>
            <span className="mb-2">
                <b><FormattedMessage {...messages.equipmentHistoryTitle} /></b>
                {equipment && <Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEntry(equipment, undefined))} aria-label="Add">
                    <FontAwesomeIcon icon={faPlusSquare} />
                </Button>}
            </span>
            {error && <div><FontAwesomeIcon icon={faExclamationTriangle} color="red"/><FormattedMessage {...messages.errorFetching} /></div>}
            {isLoading && <Loading/>}
            {error === undefined && isLoading === false && 
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

export default React.memo(EquipmentHistoryTable);