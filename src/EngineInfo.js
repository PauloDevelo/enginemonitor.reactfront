import React from 'react';
import { Button } from 'reactstrap'
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";
import ClockLabel from './ClockLabel';

export const EngineInfo = ({toggleModal, brand, model, age, installation, classNames}) => {
	return (
		<div className={classNames}>
			<span className="small mb-3">
				<FormattedMessage {...engineinfomsg.today} />
				<ClockLabel />
			</span>
			<Button color="primary" size="sm" className="float-right" onClick={toggleModal}><FormattedMessage {...engineinfomsg.edit} /></Button>					
			<div>
				<span>{brand} {model} </span>
				<span className="font-weight-bold">{age} h</span>		
			</div>
			<p className="d-block">
				<FormattedMessage {...engineinfomsg.installedOn} />
				<FormattedDate value={installation} />
			</p>
		</div>
	);
}

EngineInfo.propTypes = {
	brand: PropTypes.string,
	model: PropTypes.string,
	age: PropTypes.number,
	toggleModal: PropTypes.func.isRequired,
	classNames: PropTypes.string
};

export default EngineInfo;
