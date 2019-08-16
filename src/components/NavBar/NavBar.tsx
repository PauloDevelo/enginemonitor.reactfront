import React, { useCallback } from "react";
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import ClockLabel from '../ClockLabel/ClockLabel';
import DropDownConnectionStateItem from './DropDownConnectionStateItem';

import { faSignOutAlt, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import userProxy from '../../services/UserProxy';

import jsonMessages from "./NavBar.messages.json";
const navBarMsg: Messages = defineMessages(jsonMessages);

import { UserModel } from "../../types/Types";

import './NavBar.css';

type Props = {
    user?: UserModel, 
    onLoggedOut: ()=>void, 
    isOpened: boolean, 
    toggle: ()=>void
};

const NavBar = ({user, onLoggedOut, isOpened, toggle}:Props) => {
    const logout = useCallback(() => {
        userProxy.logout();
        onLoggedOut();
    }, [onLoggedOut]);

    const textMenu = user?user.email:"Login";
	return (
		<Navbar color="dark" dark expand="md">
            <NavbarBrand href="/">
                <div className={'mr-2'}>{'Equipment maintenance'}</div><div className={'clock'}><FormattedMessage {...navBarMsg.today}/><ClockLabel /></div>
            </NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpened} navbar>
                <Nav className="ml-auto" navbar>
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret>
                        {textMenu}
                        </DropdownToggle>
                        <DropdownMenu right>
                            <DropDownConnectionStateItem />
                            <DropdownItem divider />
                            <DropdownItem onClick={logout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />{' '}<FormattedMessage {...navBarMsg.signout} />
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </Nav>
            </Collapse>
        </Navbar>
	);
}

NavBar.propTypes = {
    user: PropTypes.object,
    onLoggedOut: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired,
	isOpened: PropTypes.bool.isRequired
};

export default React.memo(NavBar);