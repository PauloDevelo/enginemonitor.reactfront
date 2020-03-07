import React, {
  useCallback, useState, useEffect,
} from 'react';
import {
  Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import Switch from 'react-switch';

import { faSignOutAlt, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';

import ClockLabel from '../ClockLabel/ClockLabel';
import DropDownConnectionStateItem from './DropDownConnectionStateItem';
import ModalAbout from '../ModalAbout/ModalAbout';
import ModalEditAsset from '../ModalEditAsset/ModalEditAsset';
import ImageFolderGauge from './ImageFolderGauge';

import userProxy from '../../services/UserProxy';
import onlineManager from '../../services/OnlineManager';
import localStorageBuilder from '../../services/LocalStorageBuilder';
import errorService from '../../services/ErrorService';

// eslint-disable-next-line no-unused-vars
import { UserModel, AssetModel } from '../../types/Types';
import userContext from '../../services/UserContext';

import assetManager from '../../services/AssetManager';

import './NavBar.css';

import jsonMessages from './NavBar.messages.json';

const navBarMsg = defineMessages(jsonMessages);

type Props = {
    user?: UserModel,
    onLoggedOut: ()=>void,
};

const NavBar = ({ onLoggedOut }:Props) => {
  const currentUser = userContext.getCurrentUser();
  const [user, setUser] = useState<UserModel | undefined>(currentUser);
  const [userImageFolderSize, setUserImageFolderSize] = useState(currentUser !== undefined ? currentUser.imageFolderSizeInByte : 0);
  const [aboutVisible, setAboutVisibility] = useState(false);
  const [assetEditionModalVisibility, setAssetEditionModalVisibility] = useState(false);
  const [offline, setOffline] = useState(onlineManager.isOfflineModeActivated());

  const [currentAsset, setCurrentAsset] = useState<AssetModel | undefined>(undefined);
  const [titleNavBar, setTitleNavBar] = useState('');

  useEffect(() => {
    const onCurrentAssetChanged = (asset: AssetModel | undefined) => {
      setCurrentAsset(asset);
      setTitleNavBar(asset === undefined ? '' : asset.name);
    };

    assetManager.registerOnCurrentAssetChanged(onCurrentAssetChanged);

    return () => assetManager.unregisterOnCurrentAssetChanged(onCurrentAssetChanged);
  });

  const [isOpened, setIsOpened] = useState(false);
  const toggle = useCallback(() => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
  }, []);

  const onUserChanged = useCallback(async (newUser: UserModel | undefined):Promise<void> => {
    setUser(newUser);
    return Promise.resolve();
  }, []);

  const onUserImageFolderSizeChanged = useCallback((newUserImageFolderSize: number) => {
    setUserImageFolderSize(newUserImageFolderSize);
  }, []);

  useEffect(() => {
    userContext.registerOnUserChanged(onUserChanged);
    userContext.registerOnUserStorageSizeChanged(onUserImageFolderSizeChanged);
    return () => {
      userContext.unregisterOnUserChanged(onUserChanged);
      userContext.unregisterOnUserStorageSizeChanged(onUserImageFolderSizeChanged);
    };
  }, [onUserChanged, onUserImageFolderSizeChanged]);

  const logout = useCallback(() => {
    userProxy.logout();
    onLoggedOut();
  }, [onLoggedOut]);

  const rebuildStorage = useCallback(() => {
    localStorageBuilder.run().catch((error) => {
      errorService.addError(error);
    });
  }, []);

  const offlineSwitch = useCallback((isOffline: boolean):void => {
    setOffline(isOffline);
    onlineManager.setOfflineMode(isOffline);
  }, []);

  const toggleAbout = useCallback(() => {
    setAboutVisibility((prevAboutVisibility) => !prevAboutVisibility);
  }, []);

  const toggleAssetEditionModal = useCallback(() => {
    setAssetEditionModalVisibility((prevVisibility) => !prevVisibility);
  }, []);

  const getTextMenu = useCallback(() => {
    if (user) {
      return user.email === '' ? user.firstname : user.email;
    }
    return 'Login';
  }, [user]);

  return (
    <>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand onClick={toggleAssetEditionModal} className="clickable">
          <div className="mr-2">{titleNavBar}</div>
          <div className="clock">
            <FormattedMessage {...navBarMsg.today} />
            <ClockLabel />
          </div>
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
                  <Switch onChange={offlineSwitch} checked={offline} className="react-switch" onColor="#28a745" height={20} width={40} />
&nbsp;Offline mode
                </DropdownItem>
                <DropDownConnectionStateItem />
                <DropdownItem divider />
                {!user?.forbidUploadingImage && (
                <DropdownItem header>
                  <ImageFolderGauge storageSizeInMB={userImageFolderSize / 1048576} storageSizeLimitInMB={user ? user.imageFolderSizeLimitInByte / 1048576 : 0} />
                </DropdownItem>
                )}
                {!user?.forbidUploadingImage && (
                <DropdownItem divider />
                )}
                <DropdownItem onClick={rebuildStorage}>
                  <FontAwesomeIcon icon={faSyncAlt} />
                  {' '}
                  <FormattedMessage {...navBarMsg.rebuildLocalStorage} />
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={logout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  {' '}
                  <FormattedMessage {...navBarMsg.signout} />
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
      {aboutVisible && <ModalAbout visible={aboutVisible} toggle={toggleAbout} className="modal-dialog-centered" />}

      {currentAsset && (
        <ModalEditAsset
          asset={currentAsset}
          visible={assetEditionModalVisibility}
          className="modal-dialog-centered"
          toggle={toggleAssetEditionModal}
          hideDeleteButton
        />
      )}
    </>
  );
};

export default React.memo(NavBar);
