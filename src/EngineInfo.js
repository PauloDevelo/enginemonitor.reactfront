import React from 'react';
import { Button } from 'reactstrap'
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";
import ClockLabel from './ClockLabel';

export const EngineInfo = ({toggleModal, data, classNames}) => {
	return (
		<div className={classNames}>
			<span className="small mb-3">
				<FormattedMessage {...engineinfomsg.today} />
				<ClockLabel />
			</span>
			{data && <Button color="primary" size="sm" className="float-right" onClick={toggleModal}><FormattedMessage {...engineinfomsg.edit} /></Button>}					
			{data && 
			<div>
				<span>{data.brand} {data.model} </span>
				<span className="font-weight-bold">{data.age} h</span>		
			</div>}
			{data && 
			<p className="d-block">
				<FormattedMessage {...engineinfomsg.installedOn} />
				<FormattedDate value={data.installation} />
			</p>}
		</div>
	);
}

EngineInfo.propTypes = {
	data: PropTypes.object,
	toggleModal: PropTypes.func.isRequired,
	classNames: PropTypes.string
};

export default EngineInfo;
