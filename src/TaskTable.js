import React from 'react';
import { Table, Button } from 'reactstrap';

import { 
	FormattedMessage
} from 'react-intl';

import tasktablemsg from "./TaskTable.messages";

import { getContext, getTodoText, shorten } from './TaskHelper'; 


function getTrContext(level){
	return "table-" + getContext(level);
}

export default class TaskTable extends React.Component {
	render() {
		var listLines = [];
		
		if(this.props.tasks){
			const trStyle = {
				cursor: 'pointer',
			};

			listLines = this.props.tasks.map((task) => {
			var shortenDescription = shorten(task.description.replace(/\n/g,'<br />'));
			var todoText = getTodoText(task)		
			var classNames = getTrContext(task.level) + " small";
				
			return(
				<tr key={task.id} style={trStyle} className={classNames} onClick={() => this.props.changeCurrentTask(task) }>
					<td>{task.name}</td>
					<td>{todoText}</td>
					<td><div dangerouslySetInnerHTML={{ __html: shortenDescription }} /></td>
				</tr>
			)});
		}

		return (
			<div className="p-2 m-2 border border-primary rounded shadow">
				<span className="mb-2"><b><FormattedMessage {...tasktablemsg.tasklistTitle} /></b>
				<Button color="primary" size="sm" className="float-right mb-2" onClick={this.props.toggleModal}><FormattedMessage {...tasktablemsg.createbutton} /></Button></span>
				<Table responsive size="sm" hover>
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