import  React, { useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { faCheckSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {CSSTransition, TransitionGroup} from 'react-transition-group';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEquipmentMonitorService } from '../../hooks/EquipmentMonitorServiceHook';
import { useEditModal } from '../../hooks/EditModalHook';

import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import EntryRow from './EntryRow';
import Loading from '../Loading/Loading';

import { createDefaultEntry } from '../../helpers/EntryHelper';

import taskTableMsg from "../TaskTable/TaskTable.messages";

import './HistoryTaskTable.css';
import '../../style/transition.css';

const HistoryTaskTable = ({equipment, task, onHistoryChanged, classNames}) => {
    const equipmentId = equipment ? equipment._id : undefined;
    const taskId = task ? task._id : undefined;

    const modalHook = useEditModal(undefined);

    const initialEntries = [];
    const fetchEntriesHook = useEquipmentMonitorService(initialEntries, EquipmentMonitorService.fetchEntries, [equipmentId, taskId], onHistoryChanged);

    useEffect(() => {
        fetchEntriesHook.doFetch([equipmentId, taskId]);
    }, [taskId]);

    const getEntries = () => {
        return fetchEntriesHook.data;
    }

    const onSavedEntry = (savedEntry) => {
            const newCurrentHistoryTask = getEntries().filter(entry => entry._id !== savedEntry._id);
            newCurrentHistoryTask.unshift(savedEntry);
            newCurrentHistoryTask.sort((entryA, entryB) => { return entryA.date - entryB.date; });

            fetchEntriesHook.changeData(newCurrentHistoryTask);
	}
	
	const onDeleteEntry = async(entry) => {  
            var newCurrentHistoryTask = getEntries().slice(0).filter(e => e._id !== entry._id);
            fetchEntriesHook.changeData(newCurrentHistoryTask);
    }

    const history = getEntries().map(entry => {
    return(
        <CSSTransition key={entry._id} in={true} timeout={500} classNames="tr">
            <EntryRow entry={entry} onClick={() => {
                modalHook.displayData(entry);
            }}/>
        </CSSTransition>
        )}
    );
    history.reverse();
    
    return(
        <div className={classNames}>

            <span className="mb-2">
                <Button color="success" size="sm" className="float-right mb-2" onClick={() => {
                    modalHook.displayData(createDefaultEntry(equipment, task));
                }}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                </Button>
            </span>
            {fetchEntriesHook.isError && <div><FontAwesomeIcon icon={faExclamationTriangle} color="red"/><FormattedMessage {...taskTableMsg.errorFetching} /></div>}
            {fetchEntriesHook.isLoading ? !fetchEntriesHook.isError && <Loading/> :
            !fetchEntriesHook.isError && <Table responsive size="sm" hover striped>
                <thead className="thead-light">
                    <tr>
                        <th><FormattedMessage {...taskTableMsg.ackDate} /></th>
                        <th><FormattedMessage {...taskTableMsg.age} /></th>
                        <th><FormattedMessage {...taskTableMsg.remarks} /></th>
                    </tr>
                </thead>
                <TransitionGroup component="tbody">
                    {history}
                </TransitionGroup>
            </Table>
            }
            
            <ModalEditEntry 
                equipment={equipment}
                task={task}
                entry={modalHook.data}
                saveEntry={onSavedEntry} 
                deleteEntry={onDeleteEntry}
                visible={modalHook.editModalVisibility}
                toggle={modalHook.toggleModal}
                className='modal-dialog-centered'
            />
        </div>
    );
}

HistoryTaskTable.propTypes = {
    equipment: PropTypes.object,
    task: PropTypes.object,
    classNames: PropTypes.string,
    onHistoryChanged: PropTypes.func,
};

export default HistoryTaskTable;