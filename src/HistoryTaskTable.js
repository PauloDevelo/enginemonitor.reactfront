import React from 'react';
import { Table } from 'reactstrap';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import tasktablemsg from "./TaskTable.messages";
import { shorten } from './TaskHelper'; 

import './HistoryTaskTable.css';

const TaskRow = ({entry, onClick}) => {
    var remarks = entry.remarks.replace(/\n/g, '<br />');
    var shortenRemarks = shorten(remarks);
    var ageStr = entry.age === -1?"":entry.age + 'h';
    var entryDate = new Date(entry.UTCDate)

    return(
        <tr className='small clickable' onClick={() => onClick()}>
            <td><FormattedDate value={entryDate} /></td>
            <td>{ageStr}</td>
            <td dangerouslySetInnerHTML={{ __html: shortenRemarks }}></td>
        </tr>
    );
}

export default function HistoryTaskTable({taskHistory, toggleEntryModal, classNames}){
    var history = [];
    if(taskHistory){
        history = taskHistory.map(entry => <TaskRow key={entry.id} entry={entry} onClick={() => toggleEntryModal(false, entry)}/>);
        history.reverse();
    }

    return(
        <div className={classNames}>
            <Table responsive size="sm" hover striped>
                <thead className="thead-light">
                    <tr>
                        <th><FormattedMessage {...tasktablemsg.ackDate} /></th>
                        <th><FormattedMessage {...tasktablemsg.engineAge} /></th>
                        <th><FormattedMessage {...tasktablemsg.remarks} /></th>
                    </tr>
                </thead>
                <tbody>
                    {history}
                </tbody>
            </Table>
        </div>
    );
}

HistoryTaskTable.propTypes = {
    taskHistory: PropTypes.array.isRequired,
    toggleEntryModal: PropTypes.func.isRequired,
    classNames: PropTypes.string
};