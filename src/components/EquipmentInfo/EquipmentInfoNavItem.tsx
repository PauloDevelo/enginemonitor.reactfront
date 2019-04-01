import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Equipment } from '../../types/Types';

type Props = {
    equipment: Equipment,
    active: boolean, 
    onClick?: () => void
};

export default function EquipmentInfoNavItem({equipment, active, onClick}: Props){
    return(
        <NavItem>
            <NavLink className={classnames({ active: active })} onClick={() => { 
                if(onClick !== undefined)
                    onClick();
             }}>
                {equipment.name}
            </NavLink>
        </NavItem>
    );
}

EquipmentInfoNavItem.propTypes = {
    equipment: PropTypes.object.isRequired,
    active: PropTypes.bool,
    onClick: PropTypes.func
};