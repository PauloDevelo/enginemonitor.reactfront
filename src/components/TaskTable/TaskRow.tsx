import React, { CSSProperties } from 'react';
import PropTypes from 'prop-types';
import { getContext, getTodoText, shorten } from '../../helpers/TaskHelper'; 
import { Task } from '../../types/Types';

const getTrContext = (level: number) => "table-" + getContext(level);

type Props = {
	task: Task,
	trStyle: CSSProperties | undefined,
	onClick?: () => void
}

const TaskRow = ({task, trStyle, onClick}: Props) => {
	var shortenDescription = shorten(task.description.replace(/\n/g,'<br />'));
	var todoText = getTodoText(task)		
	var classNames = getTrContext(task.level) + " small";
		
	return(
        <tr style={trStyle} className={classNames} onClick={() => {
            if(onClick)
                onClick();
        }}>
			<td>{task.name}</td>
			<td>{todoText}</td>
			<td><div dangerouslySetInnerHTML={{ __html: shortenDescription }} /></td>
		</tr>
	);
}

TaskRow.propTypes = {
	task: PropTypes.object.isRequired,
	trStyle: PropTypes.object,
	onClick: PropTypes.func
};

export default TaskRow;