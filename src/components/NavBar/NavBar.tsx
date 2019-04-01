import React, { useState } from "react";
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes, { number } from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import navBarMsg from "./NavBar.messages";
import { User } from "../../types/Types";

type Props = {
    user: User, 
    onLoggedOut: ()=>void, 
    isOpened: boolean, 
    toggle: ()=>void
};

type Position = {
    latitude: number,
    longitude: number
}

const NavBar = ({user, onLoggedOut, isOpened, toggle}:Props) => {
    const [position, setPosition] = useState( {latitude: Number.NaN, longitude: Number.NaN });

    const logout = () => {
        EquipmentMonitorService.logout();
        onLoggedOut();
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((navigatorPosition) => {
           const pos:Position = { longitude:navigatorPosition.coords.longitude, latitude: navigatorPosition.coords.latitude };
          setPosition( pos );
        });
    }

    const positionStr = position.longitude != Number.NaN ? '(' + position.longitude.toFixed(4) + ', ' + position.latitude.toFixed(4) + ')':'';
    const navBrand = 'Equipment maintenance ' + positionStr + ' ';
    const textMenu = user?user.email:"Login";
        
	return (
		<Navbar color="dark" dark expand="md">
            <NavbarBrand href="/">{navBrand}</NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpened} navbar>
                <Nav className="ml-auto" navbar>
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret>
                        {textMenu}
                        </DropdownToggle>
                        <DropdownMenu right>
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

export default NavBar;