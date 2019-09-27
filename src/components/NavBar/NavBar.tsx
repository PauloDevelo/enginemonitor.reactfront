import React, { useCallback, useState, Fragment, useEffect } from "react";
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Progress } from 'reactstrap';
import Switch from "react-switch";

import ClockLabel from '../ClockLabel/ClockLabel';
import DropDownConnectionStateItem from './DropDownConnectionStateItem';
import ModalAbout from '../ModalAbout/ModalAbout';
import ImageFolderGauge from './ImageFolderGauge';

import { faSignOutAlt, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import userProxy from '../../services/UserProxy';
import syncService from '../../services/SyncService';

import jsonMessages from "./NavBar.messages.json";
const navBarMsg: Messages = defineMessages(jsonMessages);

import { UserModel } from "../../types/Types";
import userContext from "../../services/UserContext";

import './NavBar.css';

type Props = {
    user?: UserModel, 
    onLoggedOut: ()=>void, 
    isOpened: boolean, 
    toggle: ()=>void
};

const NavBar = ({onLoggedOut, isOpened, toggle}:Props) => {
    const [user, setUser] = useState<UserModel | undefined>(undefined);
    const [userImageFolderSize, setUserImageFolderSize] = useState(0);
    const [aboutVisible, setAboutVisibility] = useState(false);
    const [offline, setOffline] = useState(syncService.isOfflineModeActivated());

    const onUserChanged = (newUser: UserModel | undefined) => {
        setUser(newUser);
    }

    const onUserImageFolderSizeChanged = (newUserImageFolderSize: number) => {
        setUserImageFolderSize(newUserImageFolderSize);
    }

    useEffect(() => {
        userContext.registerOnUserChanged(onUserChanged);
        userContext.registerOnUserStorageSizeChanged(onUserImageFolderSizeChanged);
        return () => {
            userContext.unregisterOnUserChanged(onUserChanged);
            userContext.unregisterOnUserStorageSizeChanged(onUserImageFolderSizeChanged);
        }
    }, []);

    const logout = useCallback(() => {
        userProxy.logout();
        onLoggedOut();
    }, [onLoggedOut]);

    const offlineSwitch = (offline: boolean):void => {
        setOffline(offline);
        syncService.setOfflineMode(offline);
    }

    const toggleAbout = () => {
        setAboutVisibility(!aboutVisible);
    }

    const getTextMenu = useCallback(() => {
        return user?user.email:"Login";
    }, [user]);

	return (
        <Fragment>
            <Navbar color="dark" dark expand="md">
                <NavbarBrand href="/">
                    <div className={'mr-2'}>{'Equipment maintenance'}</div><div className={'clock'}><FormattedMessage {...navBarMsg.today}/><ClockLabel /></div>
                </NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpened} navbar>
                    <Nav className="ml-auto" navbar>
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret>
                            {getTextMenu()}
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem header>
                                    <Switch onChange={offlineSwitch} checked={offline} className="react-switch" onColor="#28a745" height={20} width={40}/>&nbsp;Offline mode
                                </DropdownItem>
                                <DropDownConnectionStateItem />
                                <DropdownItem divider />
                                <DropdownItem header>
                                    <ImageFolderGauge storageSizeInMB={userImageFolderSize/1048576} storageSizeLimitInMB={user?user.imageFolderSizeLimitInByte/1048576:0}/>
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem onClick={logout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} />{' '}<FormattedMessage {...navBarMsg.signout} />
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem onClick={toggleAbout}>
                                    <FormattedMessage {...navBarMsg.about} />
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Nav>
                </Collapse>
            </Navbar>
            {aboutVisible && <ModalAbout visible={aboutVisible} toggle={toggleAbout} className='modal-dialog-centered'/>}
        </Fragment>
	);
}

NavBar.propTypes = {
    user: PropTypes.object,
    onLoggedOut: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired,
	isOpened: PropTypes.bool.isRequired
};

export default React.memo(NavBar);