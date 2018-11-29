import React from 'react';
import { Table } from 'reactstrap';

import { 
	FormattedMessage, FormattedDate
} from 'react-intl';

import tasktablemsg from "./TaskTable.messages";

import { shorten } from './TaskHelper'; 

export default function HistoryTaskTable(props)
{
    var history = [];
    if(props.taskHistory){
        const trStyle = {
            cursor: 'pointer',
        };

        history = props.taskHistory.map(entry => {
            var remarks = entry.remarks.replace(/\n/g, '<br />');

            var entryDate = new Date(entry.UTCDate)
            
            var shortenRemarks = shorten(remarks);
            var ageStr = entry.age === -1?"":entry.age + 'h';

            return(
                <tr key={entry.id} style={trStyle} className='small'>
                    <td><FormattedDate value={entryDate} /></td>
                    <td>{ageStr}</td>
                    <td dangerouslySetInnerHTML={{ __html: shortenRemarks }}></td>
                </tr>
            );
        });

        history.reverse();
    }

    return(
        <div className="p-2 m-2 border border-primary rounded shadow">
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