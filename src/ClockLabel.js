import React, { Component } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';

class ClockLabel extends Component {
    constructor(props) {
      super(props);
		this.state = {
			currentDate: new Date()
		}
    }
    
	componentDidMount() {
		this.intervalID = setInterval(
			() => this.setState((prevState, props) => {return { currentDate: new Date() };}),
			1000
		);
	}
	componentWillUnmount() {
		clearInterval(this.intervalID);
	}
	
    render = () => {
		return (
			<div>
				<FormattedDate value={this.state.currentDate} />
				<span> </span>
				<FormattedTime value={this.state.currentDate} hour='numeric' minute='numeric' second='numeric'/>
			</div>
		)
		
	}
}

export default ClockLabel;
