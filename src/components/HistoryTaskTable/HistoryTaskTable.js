import  React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { faCheckSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {CSSTransition, TransitionGroup} from 'react-transition-group'
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';
import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import EntryRow from './EntryRow';
import Loading from '../Loading/Loading'

import { createDefaultEntry } from '../../helpers/EntryHelper'

import taskTableMsg from "../TaskTable/TaskTable.messages";

import './HistoryTaskTable.css';
import '../../style/transition.css';

const HistoryTaskTable = ({equipment, task, onHistoryChanged, classNames}) => {
    const [editEntryModalVisibility, setEditEntryModalVisibility] = useState(false);
    const [editedEntry, setEditedEntry] = useState(undefined);
    const [taskHistory, setTaskHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const toggleEditEntryModal = () => {
        setEditEntryModalVisibility(!editEntryModalVisibility);
    }

    const fetchEntries = async() => {
        setIsError(false);
        setIsLoading(true);

        try{
            let entries = [];
            if(equipment && task){
                entries = await EquipmentMonitorService.fetchEntries(equipment._id, task._id);
            }
            setTaskHistory(entries);
        }
        catch(error){
            setIsError(true);
        }

        setIsLoading(false);
    }

    useEffect(() => {
        fetchEntries();
    }, [task]);

    const onSavedEntry = (savedEntry) => {
            const newCurrentHistoryTask = taskHistory.filter(entry => entry._id !== savedEntry._id);
            newCurrentHistoryTask.unshift(savedEntry);
            newCurrentHistoryTask.sort((entrya, entryb) => { return entrya.date - entryb.date; });

            changeCurrentHistory(newCurrentHistoryTask);
	}
	
	const onDeleteEntry = async(entryId) => {  
            var newCurrentHistoryTask = taskHistory.slice(0).filter(e => e._id !== entryId);

            changeCurrentHistory(newCurrentHistoryTask);
    }
    
    const changeCurrentHistory = (newCurrentHistoryTask) => {
        setTaskHistory(newCurrentHistoryTask);

        if(onHistoryChanged){
            onHistoryChanged(newCurrentHistoryTask);
        }
    }

    let history = [];
    if(taskHistory && taskHistory.length > 0){
        history = taskHistory.map(entry => {
        return(
            <CSSTransition key={entry._id} in={true} timeout={500} classNames="tr">
                <EntryRow entry={entry} onClick={() => {
                    setEditedEntry(entry);
                    setEditEntryModalVisibility(true);
                }}/>
            </CSSTransition>
            )}
        );
        history.reverse();
    }

    return(
        <div className={classNames}>

            <span className="mb-2">
                <Button color="success" size="sm" className="float-right mb-2" onClick={() => {
                    setEditedEntry(createDefaultEntry(equipment, task));
                    setEditEntryModalVisibility(true);
                }}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                </Button>
            </span>
            {isError && <div><FontAwesomeIcon icon={faExclamationTriangle} color="red"/><FormattedMessage {...taskTableMsg.errorFetching} /></div>}
            {isLoading ? !isError && <Loading/> :
            !isError && <Table responsive size="sm" hover striped>
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
                entry={editedEntry}
                saveEntry={onSavedEntry} 
                deleteEntry={onDeleteEntry}
                visible={editEntryModalVisibility}
                toggle={toggleEditEntryModal}
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