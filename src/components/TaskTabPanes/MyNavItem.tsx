import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

type Props = {
    classNames: string,
    activeFunc: () => void, 
    label: MessageDescriptor
};

const MyNavItem = ({classNames, activeFunc, label}:Props) => {
    return <NavItem>
                <NavLink className={classNames} 
                    onClick={activeFunc}>
                    <FormattedMessage {...label}/>
                </NavLink>
            </NavItem>
} 

export default React.memo(MyNavItem);