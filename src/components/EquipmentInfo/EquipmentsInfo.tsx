import React, {Fragment, useState, useEffect} from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import equipmentInfoMsg from "./EquipmentInfo.messages";
import ClockLabel from '../ClockLabel/ClockLabel';
import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';
import Loading from '../Loading/Loading';
import { createDefaultEquipment } from '../../helpers/EquipmentHelper';
import { User, Equipment } from '../../types/Types';

type Props = {
	user?: User, 
	changeCurrentEquipment: (equipment: Equipment | undefined) => void, 
	extraClassNames: string
}

export default function EquipmentsInfo({user, changeCurrentEquipment, extraClassNames}: Props){
	const [currentEquipment, setCurrentEquipment] = useState<Equipment | undefined>(undefined);
	const modalHook = useEditModal<Equipment | undefined>(undefined);
	
	const isCurrentEquipment = (equipment: Equipment) => {
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

	const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

	const fetchEquipments = async () => {
		setIsLoading(true);

		try {
			const equipments = await EquipmentMonitorService.fetchEquipments();
			setEquipments(equipments);
		} catch (error) {
			setEquipments([]);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		fetchEquipments();
	}, [user]);

    useEffect(() => {
        if (equipments.length > 0){
			if(currentEquipment === undefined || equipments.indexOf(currentEquipment) === -1){
				setCurrentEquipment(equipments[0]);
			}
        }
        else{
            setCurrentEquipment(undefined);
        }
	}, [equipments]);

	const onEquipmentInfoSaved = async (equipmentInfoSaved: Equipment) => {
		const newEquipmentList = equipments.concat([]);
		const index = newEquipmentList.findIndex(equipmentInfo => equipmentInfo._id === equipmentInfoSaved._id);

		if(index === -1){
			newEquipmentList.push(equipmentInfoSaved);
		}
		else{
			newEquipmentList[index] = equipmentInfoSaved;
		}
        
		setEquipments(newEquipmentList);
			
		setCurrentEquipment(equipmentInfoSaved);
	}
	
	const onEquipmentDeleted = (deletedEquipment: Equipment) => {
		const newEquipmentList = equipments.filter(equipmentInfo => equipmentInfo._id !== deletedEquipment._id);
		setEquipments(newEquipmentList);
			
		setCurrentEquipment(newEquipmentList.length > 0 ? newEquipmentList[0] : undefined);
	}
	
	const tabPanes =  equipments.map((equipment, index) => {
		return <EquipmentInfoTab key={equipment._id} equipment={equipment} onClick={() => {
			modalHook.displayData(currentEquipment);
		}}/>;
	});

	const tabNavItems = equipments.map((equipment) => {
		return <EquipmentInfoNavItem key={equipment._id} equipment={equipment} active={isCurrentEquipment(equipment)} onClick={() => setCurrentEquipment(equipment)}/>;
	});

	return (
		<Fragment>
			<div className={extraClassNames}>
				<span className="small mb-3">
					<Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEquipment())}>
						<FontAwesomeIcon icon={faPlusSquare} />
					</Button>
				</span>
				{isLoading ? <Loading/> :
				<Fragment>
					<Nav tabs>
						{tabNavItems}
					</Nav>
					<TabContent activeTab={currentEquipment?currentEquipment._id:undefined}>
						{tabPanes}
					</TabContent>
				</Fragment>}
			</div>
			{modalHook.data !== undefined && <ModalEquipmentInfo equipment={modalHook.data}
								onEquipmentInfoSaved={onEquipmentInfoSaved} 
								onEquipmentDeleted={onEquipmentDeleted}
								visible={modalHook.editModalVisibility} 
								toggle={modalHook.toggleModal} 
								className='modal-dialog-centered'/>}
		</Fragment>
	);
}

EquipmentsInfo.propTypes = {
	user: PropTypes.object,
	changeCurrentEquipment: PropTypes.func.isRequired,
	extraClassNames: PropTypes.string
};