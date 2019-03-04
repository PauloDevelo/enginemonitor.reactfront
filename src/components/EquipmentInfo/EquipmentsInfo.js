import React from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import equipmentinfomsg from "./EquipmentInfo.messages";
import ClockLabel from '../ClockLabel/ClockLabel';
import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';

export default function EquipmentsInfo({equipments, toggleModal, currentEquipmentIndex, changeCurrentEquipment, extraClassNames}){
	var tabnavItems = [];
	var tabPanes = [];
	
	var currentEquipmentId = undefined;
	if(currentEquipmentIndex !== -1)
		currentEquipmentId = equipments[currentEquipmentIndex]._id;

	tabPanes = equipments.map((equipment, index) => {
		return <EquipmentInfoTab equipment={equipment} onClick={() => toggleModal(false)}/>;
	});

	tabnavItems = equipments.map((equipment, index) => {
		return <EquipmentInfoNavItem equipment={equipment} active={currentEquipmentIndex === index} onClick={() => { changeCurrentEquipment(index); }}/>;
	});

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