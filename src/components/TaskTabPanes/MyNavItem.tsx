import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';

type Props = {
    classNames: string,
    activeFunc: () => void,
    label: MessageDescriptor
};

const MyNavItem = ({ classNames, activeFunc, label }:Props) => (
  <NavItem>
    <NavLink
      className={classNames}
      onClick={activeFunc}
    >
      <FormattedMessage {...label} />
    </NavLink>
  </NavItem>
);

export default React.memo(MyNavItem);
