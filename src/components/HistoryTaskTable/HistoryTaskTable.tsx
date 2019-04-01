import  React, { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import { faCheckSquare, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {CSSTransition, TransitionGroup} from 'react-transition-group';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import ModalEditEntry from '../ModalEditEntry/ModalEditEntry';
import EntryRow from './EntryRow';
import Loading from '../Loading/Loading';

import { createDefaultEntry } from '../../helpers/EntryHelper';

import taskTableMsg from "../TaskTable/TaskTable.messages";

import './HistoryTaskTable.css';
import '../../style/transition.css';
import { Equipment, Task, Entry } from '../../types/Types';

type Props = {
    equipment: Equipment | undefined,
    task: Task | undefined, 
    onHistoryChanged: (newEntries: Entry[])=>void,
    classNames: string
}

const HistoryTaskTable = ({equipment, task, onHistoryChanged, classNames}: Props) => {
    const equipmentId = equipment ? equipment._id : undefined;
    const taskId = task ? task._id : undefined;

    const modalHook = useEditModal<Entry | undefined>(undefined);

    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
      fetchEntries();
    }, [taskId]);

    const fetchEntries = async () => {
      setIsError(false);
      setIsLoading(true);
  
      try {
        let newEntries:Entry[] = [];
        if(equipmentId && taskId){
            newEntries = await EquipmentMonitorService.fetchEntries(equipmentId, taskId);
        }
        
        setEntries(newEntries);
      } catch (error) {
        setIsError(true);
      }
  
      setIsLoading(false);
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

    const history = entries.map(entry => {
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
                {task && <Button color="success" size="sm" className="float-right mb-2" onClick={() => {
                    modalHook.displayData(createDefaultEntry(equipment, task));
                }}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                </Button>}
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

export default HistoryTaskTable;