/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */

import React, { useCallback } from 'react';
import { NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
// eslint-disable-next-line no-unused-vars
import { EquipmentModel } from '../../types/Types';

type Props = {
    equipment: EquipmentModel,
    active: boolean,
    setCurrentEquipment?: (equipment: EquipmentModel) => void
};

function EquipmentInfoNavItem({ equipment, active, setCurrentEquipment }: Props) {
  const setCurrentEquipmentCallBack = useCallback(() => {
    if (setCurrentEquipment) { setCurrentEquipment(equipment); }
  }, [equipment, setCurrentEquipment]);

  return (
    <NavItem>
      <NavLink className={classnames({ active })} onClick={setCurrentEquipmentCallBack}>
        {equipment.name}
      </NavLink>
    </NavItem>
  );
}

export default React.memo(EquipmentInfoNavItem);
