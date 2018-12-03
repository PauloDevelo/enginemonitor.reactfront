import React from 'react';
import { Table } from 'reactstrap';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import tasktablemsg from "./TaskTable.messages";
import { shorten } from './TaskHelper'; 

export default function HistoryTaskTable({taskHistory, toggleEntryModal, classNames}){
    var history = [];
    if(taskHistory){
        const trStyle = {
            cursor: 'pointer',
        };

        history = taskHistory.map(entry => {
            var remarks = entry.remarks.replace(/\n/g, '<br />');

            var entryDate = new Date(entry.UTCDate)
            
            var shortenRemarks = shorten(remarks);
            var ageStr = entry.age === -1?"":entry.age + 'h';

            return(
                <tr key={entry.id} style={trStyle} className='small' onClick={() => toggleEntryModal(false, entry)}>
                    <td><FormattedDate value={entryDate} /></td>
                    <td>{ageStr}</td>
                    <td dangerouslySetInnerHTML={{ __html: shortenRemarks }}></td>
                </tr>
            );
        });

        history.reverse();
    }

    return(
        <div className={classNames}>
            <Table responsive size="sm" hover>
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