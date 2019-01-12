import React from 'react';
import { Button, Nav, TabPane, TabContent, NavItem, NavLink } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import engineinfomsg from "./EngineInfo.messages";
import ClockLabel from './ClockLabel';

export default function EngineInfo({boats, toggleModal, currentBoatIndex, changeCurrentBoat, extraClassNames}){
	var tabnavItems = [];
	var tabPanes = [];
	if(boats){
		tabPanes = boats.map((boat, index) => {
			return(
				<TabPane tabId={boat._id} key={index}>
					<Button color="light" size="sm" className="float-right" onClick={() => toggleModal(false)}><FontAwesomeIcon icon={faEdit} /></Button>					
					<div>
						<span>{boat.engineBrand} {boat.engineModel} </span>
						<span className="font-weight-bold">{boat.engineAge} h</span>		
					</div>
					<p className="d-block">
						<FormattedMessage {...engineinfomsg.installedOn} />
						<FormattedDate value={boat.engineInstallation} />
					</p>
				</TabPane>
			)
		});

		tabnavItems = boats.map((boat, index) => {
			return(
				<NavItem key={boat._id}>
					<NavLink className={classnames({ active: currentBoatIndex === index })} onClick={() => { changeCurrentBoat(index); }}>
						{boat.name}
					</NavLink>
				</NavItem>
			)
		});
	}

	return (
		<div className={extraClassNames}>
			<span className="small mb-3">
				<FormattedMessage {...engineinfomsg.today} />
				<ClockLabel />
				<Button color="light" size="sm" className="float-right mb-2" onClick={() => toggleModal(true)}><FontAwesomeIcon icon={faPlusSquare} /></Button>
			</span>
			<Nav tabs>
				{tabnavItems}
			</Nav>
			<TabContent activeTab={currentBoatIndex}>
				{tabPanes}
			</TabContent>
		</div>
	);
}

EngineInfo.propTypes = {
	boats: PropTypes.array,
	currentBoatIndex: PropTypes.number,
	changeCurrentBoat: PropTypes.func.isRequired,
	toggleModal: PropTypes.func.isRequired,
	extraClassNames: PropTypes.string
};