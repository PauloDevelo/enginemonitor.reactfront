import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';

type Props = {
    // eslint-disable-next-line react/require-default-props
    className?: string,
    // eslint-disable-next-line react/require-default-props
    activeFunc?: () => void,
    label: MessageDescriptor
};

const MyNavItem = ({ className, activeFunc, label }:Props) => (
  <NavItem>
    <NavLink
      className={className}
      onClick={activeFunc}
    >
      <FormattedMessage {...label} />
    </NavLink>
  </NavItem>
);

export default React.memo(MyNavItem);
