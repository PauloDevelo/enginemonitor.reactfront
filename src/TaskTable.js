import React from 'react';
import { Table, Button } from 'reactstrap';

import { 
	FormattedMessage,
	FormattedDate
} from 'react-intl';

import tasktablemsg from "./TaskTable.messages";

function shorten(longStr){
	var shortenStr = longStr;
	if(shortenStr.length > 80){
		shortenStr = longStr.substring(0, 80) + ' ...';
	}
	
	return shortenStr;
}

function getContext(level){
	if(level === 1){
		return "success";
	}
	else if(level === 2){
		return "warning";
	}
	else if(level === 3){
		return "danger";
	}
}

function getTrContext(level){
	return "table-" + getContext(level);
}

export default class TaskTable extends React.Component {
  render() {
		var listLines = [];
		
		if(this.props.tasks){
			listLines = this.props.tasks.map((task) => {
			var shortenDescription = shorten(task.description.replace(/\n/g,'<br />'));
			var dueDate = new Date(task.nextDueDate);
			var todoText = undefined;
			if(task.engineHours === -1){
				if(task.level === 3){
					todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendone} /><b><FormattedDate value={dueDate} /></b></span>;
				}
				else{
					todoText = <span><FormattedMessage {...tasktablemsg.shouldbedone} /><b><FormattedDate value={dueDate} /></b></span>;
				}
			}
			else{
				if(task.level === 3){
					todoText = <span><FormattedMessage {...tasktablemsg.shouldhavebeendonein1} /><b>{task.engineHoursLeft}h</b><FormattedMessage {...tasktablemsg.shouldhavebeendonein2} /><b><FormattedDate value={dueDate} /></b></span>;
				}
				else{
					todoText = <span><FormattedMessage {...tasktablemsg.shouldbedonein1} /><b>{task.engineHoursLeft}h</b><FormattedMessage {...tasktablemsg.shouldbedonein2} /><b><FormattedDate value={dueDate} /></b></span>;
				}
			}
				
			const trStyle = {
				cursor: 'pointer',
			};
				
			var classNames = getTrContext(task.level) + " small mb-0 mt-0";
				
			return(
				
				//tr.css("cursor", "pointer");
				<tr key={task.id} style={trStyle} className={classNames}>

					<td>{task.name}</td>
					<td>{todoText}</td>
					<td><div dangerouslySetInnerHTML={{ __html: shortenDescription }} /></td>
				</tr>
			)});
		}

    return (
			<div className="p-2 m-2 border border-primary rounded shadow">
				<span className="mb-2"><b><FormattedMessage {...tasktablemsg.tasklistTitle} /></b>
				<Button color="primary" size="sm" className="float-right mb-2"><FormattedMessage {...tasktablemsg.createbutton} /></Button></span>
				<Table responsive>
					<thead className="thead-light">
						<tr>
							<th><FormattedMessage {...tasktablemsg.taskname} /></th>
							<th><FormattedMessage {...tasktablemsg.todo} /></th>
							<th><FormattedMessage {...tasktablemsg.taskdesc} /></th>
						</tr>
					</thead>
					<tbody>
						{listLines}
					</tbody>
				</Table>
			</div>
    );
  }
}