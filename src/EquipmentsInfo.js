import React from 'react';
import { Button, Nav, TabPane, TabContent, NavItem, NavLink } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import equipmentinfomsg from "./EquipmentInfo.messages";
import ClockLabel from './ClockLabel';

export default function EquipmentsInfo({equipments, toggleModal, currentEquipmentIndex, changeCurrentEquipment, extraClassNames}){
	var tabnavItems = [];
	var tabPanes = [];
	var currentEquipmentId = undefined;

	tabPanes = equipments.map((equipment, index) => {
		return(
			<TabPane tabId={equipment._id} key={equipment._id}>
				<Button color="light" size="sm" className="float-right" onClick={() => toggleModal(false)}><FontAwesomeIcon icon={faEdit} /></Button>					
				<div>
					<span>{equipment.brand} {equipment.model} </span>
					<span className="font-weight-bold">{equipment.age} h</span>		
				</div>
				<p className="d-block">
					<FormattedMessage {...equipmentinfomsg.installedOn} />
					<FormattedDate value={equipment.installation} />
				</p>
			</TabPane>
		)
	});

	tabnavItems = equipments.map((equipment, index) => {
		return(
			<NavItem key={equipment._id}>
				<NavLink className={classnames({ active: currentEquipmentIndex === index })} onClick={() => { changeCurrentEquipment(index); }}>
					{equipment.name}
				</NavLink>
			</NavItem>
		)
	});

	if(currentEquipmentIndex !== undefined)
		currentEquipmentId = equipments[currentEquipmentIndex]._id;

	return (
		<div className={extraClassNames}>
			<span className="small mb-3">
				<FormattedMessage {...equipmentinfomsg.today} />
				<ClockLabel />
				<Button color="light" size="sm" className="float-right mb-2" onClick={() => toggleModal(true)}><FontAwesomeIcon icon={faPlusSquare} /></Button>
			</span>
			<Nav tabs>
				{tabnavItems}
			</Nav>
			<TabContent activeTab={currentEquipmentId}>
				{tabPanes}
			</TabContent>
		</div>
	);
}

EquipmentsInfo.propTypes = {
	equipments: PropTypes.array,
	currentEquipmentIndex: PropTypes.number,
	changeCurrentEquipment: PropTypes.func.isRequired,
	toggleModal: PropTypes.func.isRequired,
	extraClassNames: PropTypes.string
};