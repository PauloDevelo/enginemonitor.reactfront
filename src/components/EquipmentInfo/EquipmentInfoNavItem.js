import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function EquipmentInfoNavItem({equipment, active, onClick}){
    return(
        <NavItem>
            <NavLink className={classnames({ active: active })} onClick={() => { 
                if(onClick)
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