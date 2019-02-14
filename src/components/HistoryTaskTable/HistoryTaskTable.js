import React from 'react';
import { Table } from 'reactstrap';
import { FormattedMessage, FormattedDate } from 'react-intl';
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import PropTypes from 'prop-types';
import tasktablemsg from "../TaskTable/TaskTable.messages";
import { shorten } from '../../helpers/TaskHelper'; 

import './HistoryTaskTable.css';
import '../../style/transition.css';

const TaskRow = ({entry, onClick}) => {
    var remarks = entry.remarks.replace(/\n/g, '<br />');
    var shortenRemarks = shorten(remarks);
    var ageStr = entry.age === -1?"":entry.age + 'h';
    var entryDate = new Date(entry.date)

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
        
        history = taskHistory.map(entry => {
        return(
            <CSSTransition key={entry._id} in={true} timeout={500} classNames="tr">
                <TaskRow entry={entry} onClick={() => toggleEntryModal(false, entry)}/>
            </CSSTransition>
            )}
        );
        history.reverse();
    }

    return(
        <div className={classNames}>
            <Table responsive size="sm" hover striped>
                <thead className="thead-light">
                    <tr>
                        <th><FormattedMessage {...tasktablemsg.ackDate} /></th>
                        <th><FormattedMessage {...tasktablemsg.age} /></th>
                        <th><FormattedMessage {...tasktablemsg.remarks} /></th>
                    </tr>
                </thead>
                <TransitionGroup component="tbody">
                    {history}
                </TransitionGroup>
            </Table>
        </div>
    );
}

HistoryTaskTable.propTypes = {
    taskHistory: PropTypes.array.isRequired,
    toggleEntryModal: PropTypes.func.isRequired,
    classNames: PropTypes.string
};