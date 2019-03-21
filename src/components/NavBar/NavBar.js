import React, { useState } from "react";
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import navBarMsg from "./NavBar.messages";

const NavBar = ({user, onLoggedOut, isOpened, toggle}) => {
    const [position, setPosition] = useState(undefined);

    const logout = () => {
        EquipmentMonitorService.logout();
        onLoggedOut();
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((navigatorPosition) => {
          var pos = {
            lat: navigatorPosition.coords.latitude,
            lng: navigatorPosition.coords.longitude
          };
          setPosition( pos );
        });
    }

    const positionStr = position ? '(' + position.lng.toFixed(4) + ', ' + position.lat.toFixed(4) + ')':'';
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