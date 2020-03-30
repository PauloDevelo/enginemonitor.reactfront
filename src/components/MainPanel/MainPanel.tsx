import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';

import { useParams } from 'react-router-dom';

import { scrollTo } from '../../helpers/Helpers';

import TaskTabPanes from '../TaskTabPanes/TaskTabPanes';
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable';
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails';
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import TaskProgressBar from '../TaskProgressBar/TaskProgressBar';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import CacheBuster from '../CacheBuster/CacheBuster';

import localStorageBuilder from '../../services/LocalStorageBuilder';
import syncService from '../../services/SyncService';
import guestLinkProxy from '../../services/GuestLinkProxy';
import userProxy from '../../services/UserProxy';
import errorService from '../../services/ErrorService';

import assetManager from '../../services/AssetManager';
import { createDefaultAsset } from '../../helpers/AssetHelper';

import '../../style/transition.css';
import './MainPanel.css';

import
{
  // eslint-disable-next-line no-unused-vars
  UserModel, TaskModel, AssetModel,
} from '../../types/Types';

import ModalEditAsset from '../ModalEditAsset/ModalEditAsset';

export default function MainPanel() {
  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [currentAsset, setCurrentAsset] = useState<AssetModel | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const { niceKey } = useParams();

  const onListErrorChanged = (errors: Error[]) => {
    if (errors.length > 0) {
      setError(errors[errors.length - 1]);
    } else {
      setError(undefined);
    }
  };

  useEffect(() => {
    assetManager.registerOnCurrentAssetChanged(setCurrentAsset);

    return () => {
      assetManager.unregisterOnCurrentAssetChanged(setCurrentAsset);
    };
  }, []);

  useEffect(() => {
    const refreshCurrentUser = async () => {
      const currentUser = niceKey ? await guestLinkProxy.tryGetAndSetUserFromNiceKey(niceKey) : await userProxy.tryGetAndSetMemorizedUser();
      setUser(currentUser);
    };

    refreshCurrentUser();
    errorService.registerOnListErrorChanged(onListErrorChanged);

    return () => {
      errorService.unregisterOnListErrorChanged(onListErrorChanged);
    };
  }, [niceKey]);


  const dismissError = useCallback(() => {
    if (error !== undefined) {
      errorService.removeError(error);
    }
  }, [error]);


  const cardTaskDetailDomRef = useRef(null);
  const cardTaskDetailDomCallBack = useCallback((node) => { cardTaskDetailDomRef.current = node; }, []);

  // eslint-disable-next-line no-unused-vars
  const onClickTaskTable = useCallback((task: TaskModel) => {
    if (cardTaskDetailDomRef.current != null) {
      scrollTo((cardTaskDetailDomRef!.current! as any).offsetLeft, (cardTaskDetailDomRef!.current! as any).offsetTop, 250);
    }
  }, []);

  const [modalSignupVisible, setModalSignupVisible] = useState(false);

  const toggleModalSignup = useCallback(() => setModalSignupVisible((prevModalSignupVisible) => !prevModalSignupVisible), []);
  const logOut = useCallback(() => setUser(undefined), []);

  const panelClassNames = 'p-2 m-2 border border-secondary rounded shadow';

  return (
    <CacheBuster>
      {({ loading, isLatestVersion, refreshCacheAndReload }:any) => {
        if (loading) return null;
        if (!loading && !isLatestVersion) {
          // You can decide how and when you want to force reload
          refreshCacheAndReload();
        }

        return (
          <>
            <>
              <NavBar onLoggedOut={logOut} />
              <div className="appBody mb-2">
                <div className="wrapperColumn">
                  <EquipmentsInfo className={`${panelClassNames} columnHeader`} />
                  <TaskTabPanes
                    className={`${panelClassNames} columnBody`}
                    changeCurrentTask={onClickTaskTable}
                  />
                </div>
                <div className="wrapperColumn">
                  <CardTaskDetails
                    callBackRef={cardTaskDetailDomCallBack}
                    className={`${panelClassNames} columnHeader`}
                  />
                  <HistoryTaskTable
                    className={`${panelClassNames} columnBody lastBlock`}
                  />
                </div>
              </div>
              <TaskProgressBar taskWithProgress={syncService} title="syncInProgress" color="warning" className="bottomright" />
              <TaskProgressBar taskWithProgress={localStorageBuilder} title="rebuildInProgress" color="success" className="bottomright" />
              <ErrorAlert error={error} onDismiss={dismissError} className="verytop bottomright" timeoutInMs={5000} />
            </>

            {!user && (
            <ModalLogin
              visible={!user}
              onLoggedIn={setUser}
              className="modal-dialog-centered"
              toggleModalSignup={toggleModalSignup}
            />
            )}

            {user && !currentAsset && (
            <ModalEditAsset
              asset={createDefaultAsset()}
              visible={user && !currentAsset}
              className="modal-dialog-centered"
            />
            )}

            {modalSignupVisible && (
            <ModalSignup
              visible={modalSignupVisible}
              toggle={toggleModalSignup}
              className="modal-dialog-centered"
            />
            )}
          </>
        );
      }}
    </CacheBuster>
  );
}
