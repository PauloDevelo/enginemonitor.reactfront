import React, {Fragment, useState, useEffect, useCallback} from 'react';
import { Button, Nav, TabContent } from 'reactstrap';
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {equipmentProxy} from '../../services/EquipmentMonitorServiceProxy';

import { useEditModal } from '../../hooks/EditModalHook';

import EquipmentInfoTab from './EquipmentInfoTab';
import EquipmentInfoNavItem from './EquipmentInfoNavItem';
import ModalEquipmentInfo from '../ModalEquipmentInfo/ModalEquipmentInfo';
import Loading from '../Loading/Loading';

import { createDefaultEquipment } from '../../helpers/EquipmentHelper';

import PropTypes from 'prop-types';
import { UserModel, EquipmentModel } from '../../types/Types';

type Props = {
	user?: UserModel, 
	changeCurrentEquipment: (equipment: EquipmentModel | undefined) => void, 
	extraClassNames: string
}

function EquipmentsInfo({user, changeCurrentEquipment, extraClassNames}: Props){
	const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(undefined);
	const modalHook = useEditModal<EquipmentModel | undefined>(undefined);
	
	const isCurrentEquipment = (equipment: EquipmentModel) => {
		if (currentEquipment === undefined || equipment === undefined){
			return false;
		}
		else{
			return currentEquipment._uiId === equipment._uiId;
		}
	}

	useEffect(() => {
		changeCurrentEquipment(currentEquipment);
	}, [currentEquipment]);

	const [equipments, setEquipments] = useState<EquipmentModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

	const fetchEquipments = async () => {
		setIsLoading(true);

		try {
			const equipments = await equipmentProxy.fetchEquipments();
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
			if(currentEquipment === undefined || equipments.findIndex((equipment: EquipmentModel) => currentEquipment._uiId === equipment._uiId) === -1){
				setCurrentEquipment(equipments[0]);
			}
			else{
				var newCurrentEquipmentIndex = equipments.findIndex((equipment: EquipmentModel) => currentEquipment._uiId === equipment._uiId);
				setCurrentEquipment(equipments[newCurrentEquipmentIndex]);
			}
        }
        else{
            setCurrentEquipment(undefined);
        }
	}, [equipments]);

	const onEquipmentInfoSaved = useCallback(async (equipmentInfoSaved: EquipmentModel) => {
		const newEquipmentList = equipments.concat([]);
		const index = newEquipmentList.findIndex(equipmentInfo => equipmentInfo._uiId === equipmentInfoSaved._uiId);

		if(index === -1){
			newEquipmentList.push(equipmentInfoSaved);
		}
		else{
			newEquipmentList[index] = equipmentInfoSaved;
		}
        
		setEquipments(newEquipmentList);
	}, [equipments]);
	
	const onEquipmentDeleted = useCallback((deletedEquipment: EquipmentModel) => {
		const newEquipmentList = equipments.filter(equipmentInfo => equipmentInfo._uiId !== deletedEquipment._uiId);
		setEquipments(newEquipmentList);
			
		setCurrentEquipment(newEquipmentList.length > 0 ? newEquipmentList[0] : undefined);
	}, [equipments]);
	
	const tabPanes =  equipments.map((equipment, index) => {
		return <EquipmentInfoTab key={equipment._uiId} equipment={equipment} displayEquipment={modalHook.displayData}/>;
	});

	const tabNavItems = equipments.map((equipment) => {
		return <EquipmentInfoNavItem key={equipment._uiId} equipment={equipment} active={isCurrentEquipment(equipment)} setCurrentEquipment={setCurrentEquipment}/>;
	});

	return (
		<Fragment>
			<div className={extraClassNames}>
				<span className="small mb-3">
					<Button color="light" size="sm" className="float-right mb-2" onClick={() => modalHook.displayData(createDefaultEquipment())} aria-label="Add">
						<FontAwesomeIcon icon={faPlusSquare} />
					</Button>
				</span>
				{isLoading ? <Loading/> :
				<Fragment>
					<Nav tabs>
						{tabNavItems}
					</Nav>
					<TabContent activeTab={currentEquipment?currentEquipment._uiId:undefined}>
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

export default React.memo(EquipmentsInfo);

EquipmentsInfo.propTypes = {
	user: PropTypes.object,
	changeCurrentEquipment: PropTypes.func.isRequired,
	extraClassNames: PropTypes.string
};