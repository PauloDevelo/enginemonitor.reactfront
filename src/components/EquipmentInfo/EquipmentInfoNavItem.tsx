import React, { useCallback } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Equipment } from '../../types/Types';

type Props = {
    equipment: Equipment,
    active: boolean, 
    setCurrentEquipment?: (equipment: Equipment) => void
};

function EquipmentInfoNavItem({equipment, active, setCurrentEquipment}: Props){
    const setCurrentEquipmentCallBack = useCallback(() => {
        if(setCurrentEquipment)
            setCurrentEquipment(equipment);
    }, [equipment, setCurrentEquipment]);

    return(
        <NavItem>
            <NavLink className={classnames({ active: active })} onClick={setCurrentEquipmentCallBack} >
                {equipment.name}
            </NavLink>
        </NavItem>
    );
}

export default React.memo(EquipmentInfoNavItem);

EquipmentInfoNavItem.propTypes = {
    equipment: PropTypes.object.isRequired,
    active: PropTypes.bool,
    onClick: PropTypes.func
};