import React, {Fragment, useState, useEffect} from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEquipmentMonitorService } from '../../hooks/EquipmentMonitorServiceHook';
import { useEditModal } from '../../hooks/EditModalHook';

import equipmentInfoMsg from "./EquipmentInfo.messages";
import ClockLabel from '../ClockLabel/ClockLabel';
import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';
import { createDefaultEquipment } from '../../helpers/EquipmentHelper';

export default function EquipmentsInfo({user, changeCurrentEquipment, extraClassNames}){
	const [currentEquipment, setCurrentEquipment] = useState(undefined);
	const modalHook = useEditModal(undefined);
	
	const isCurrentEquipment = (equipment) => {
		if (currentEquipment === undefined || equipment === undefined){
			return false;
		}
		else{
			return currentEquipment._id === equipment._id;
		}
	}

	useEffect(() => {
		changeCurrentEquipment(currentEquipment);
	}, [currentEquipment]);

	const fetchEquipmentsHook = useEquipmentMonitorService([], EquipmentMonitorService.fetchEquipments, []);
	
	const getEquipments = () => {
		return fetchEquipmentsHook.data;
	}

	useEffect(() => {
		if (getEquipments().length > 0){
			setCurrentEquipment(getEquipments()[0]);
		}
		else{
			setCurrentEquipment(undefined);
		}

	}, [fetchEquipmentsHook.data]);

	useEffect(() => {
		fetchEquipmentsHook.doFetch([]);
	}, [user]);

	const onEquipmentInfoSaved = async (equipmentInfoSaved) => {
		const newEquipmentList = getEquipments().filter(equipmentInfo => equipmentInfo._id !== equipmentInfoSaved._id);
		newEquipmentList.unshift(equipmentInfoSaved);
        
		fetchEquipmentsHook.changeData(newEquipmentList);
			
		setCurrentEquipment(equipmentInfoSaved);
	}
	
	const onEquipmentDeleted = (deletedEquipment) => {
		const newEquipmentList = getEquipments().filter(equipmentInfo => equipmentInfo._id !== deletedEquipment._id);
		fetchEquipmentsHook.changeData(newEquipmentList);
			
		setCurrentEquipment(newEquipmentList.length > 0 ? newEquipmentList[0] : undefined);
	}
	
	const tabPanes =  getEquipments().map((equipment, index) => {
		return <EquipmentInfoTab key={equipment._id} equipment={equipment} onClick={() => {
			modalHook.displayData(currentEquipment);
		}}/>;
	});

	const tabnavItems = getEquipments().map((equipment, index) => {
		return <EquipmentInfoNavItem key={equipment._id} equipment={equipment} active={isCurrentEquipment(equipment)} onClick={() => setCurrentEquipment(equipment)}/>;
	});

	return (
		<Fragment>
			<div className={extraClassNames}>
				<span className="small mb-3">
					<FormattedMessage {...equipmentInfoMsg.today} />
					<ClockLabel />
					<Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEquipment())}>
						<FontAwesomeIcon icon={faPlusSquare} />
					</Button>
				</span>
				<Nav tabs>
					{tabnavItems}
				</Nav>
				<TabContent activeTab={currentEquipment?currentEquipment._id:undefined}>
					{tabPanes}
				</TabContent>
			</div>
			<ModalEquipmentInfo equipment={modalHook.data}
								onEquipmentInfoSaved={onEquipmentInfoSaved} 
								onEquipmentDeleted={onEquipmentDeleted}
								visible={modalHook.editModalVisibility} 
								toggle={modalHook.toggleModal} 
								className='modal-dialog-centered'/>
		</Fragment>
	);
}

EquipmentsInfo.propTypes = {
	user: PropTypes.object,
	changeCurrentEquipment: PropTypes.func.isRequired,
	extraClassNames: PropTypes.string
};