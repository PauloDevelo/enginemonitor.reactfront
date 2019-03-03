import React from 'react';
import { FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';

import { shorten } from '../../helpers/TaskHelper'; 

export default function EntryRow({entry, onClick}){
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

EntryRow.propTypes = {
    entry: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};