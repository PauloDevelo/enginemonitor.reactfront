import React, { 
	Component 
} from 'react';

import {
	Button
} from 'reactstrap'

import { 
	FormattedMessage,
	FormattedDate,
	FormattedTime,
} from 'react-intl';

import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";

class EngineInfo extends Component {
    constructor(props) {
      super(props);
		this.state = {
			currentDate: Date.now()
		}
    }
    
	componentDidMount() {
		this.intervalID = setInterval(
			() => this.tick(),
			1000
		);
	}
	componentWillUnmount() {
		clearInterval(this.intervalID);
	}

	tick() {
		this.setState(function(prevState, props){ 
			return { currentDate: Date.now() }; 
		});
	}
	
    render() {
        return (
            <div className={this.props.classNames}>
				<span className="small mb-3">
					<FormattedMessage {...engineinfomsg.today} />
					<FormattedDate value={this.state.currentDate} />
					<span> </span>
					<FormattedTime value={this.state.currentDate} hour='numeric' minute='numeric' second='numeric'/>
				</span>
				<Button color="primary" size="sm" className="float-right" onClick={this.props.toggleModal}><FormattedMessage {...engineinfomsg.edit} /></Button>					
				<div>
					<span>{this.props.brand} {this.props.model} </span>
					<span className="font-weight-bold">{this.props.age} h</span>		
				</div>
				<p className="d-block">
					<FormattedMessage {...engineinfomsg.installedOn} />
					<FormattedDate value={this.props.installation} />
				</p>
            </div>
        );
    }
}

EngineInfo.propTypes = {
	brand: PropTypes.string,
	model: PropTypes.string,
	age: PropTypes.number,
	toggleModal: PropTypes.func.isRequired,
	classNames: PropTypes.string
};

export default EngineInfo;
