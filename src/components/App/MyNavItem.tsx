
import React from 'react';
import { NavItem, NavLink } from 'reactstrap';
import { FormattedMessage,  } from 'react-intl';

import { useTraceUpdate } from '../../hooks/Debug';

type Props = {
    classNames: string,
    activeFunc: () => void, 
    label: FormattedMessage.MessageDescriptor
};

const MyNavItem = ({classNames, activeFunc, label}:Props) => {
    useTraceUpdate({classNames, activeFunc, label});

    return <NavItem>
                <NavLink className={classNames} 
                    onClick={activeFunc}>
                    <FormattedMessage {...label}/>
                </NavLink>
            </NavItem>
} 

export default React.memo(MyNavItem);