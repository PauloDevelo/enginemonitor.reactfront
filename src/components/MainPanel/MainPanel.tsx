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
  UserModel, EquipmentModel, TaskModel, AssetModel,
} from '../../types/Types';

import ModalEditAsset from '../ModalEditAsset/ModalEditAsset';
import equipmentManager from '../../services/EquipmentManager';
import taskManager from '../../services/TaskManager';

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

  const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(equipmentManager.getCurrentEquipment());

  const [taskList, setTaskList] = useState<TaskModel[]>(taskManager.getTasks());
  const [currentTask, setCurrentTask] = useState<TaskModel | undefined>(taskManager.getCurrentTask());

  const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);
  const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);

  useEffect(() => {
    const onCurrentAssetChanged = (asset: AssetModel|undefined) => {
      setCurrentAsset(asset);
    };

    const onCurrentEquipmentChanged = (equipment: EquipmentModel | undefined) => {
      setCurrentEquipment(equipment);
    };

    const onTasksChanged = (tasks: TaskModel[]) => {
      setTaskList(tasks);
      setEquipmentHistoryRefreshId((previousEquipmentHistoryRefreshId) => previousEquipmentHistoryRefreshId + 1);
    };

    const onCurrentTaskChanged = (task: TaskModel | undefined) => {
      setCurrentTask(task);
      setTaskHistoryRefreshId((previousTaskHistoryRefreshId) => previousTaskHistoryRefreshId + 1);
    };

    assetManager.registerOnCurrentAssetChanged(onCurrentAssetChanged);
    equipmentManager.registerOnCurrentEquipmentChanged(onCurrentEquipmentChanged);
    taskManager.registerOnCurrentTaskChanged(onCurrentTaskChanged);
    taskManager.registerOnTasksChanged(onTasksChanged);

    return () => {
      assetManager.unregisterOnCurrentAssetChanged(onCurrentAssetChanged);
      equipmentManager.unregisterOnCurrentEquipmentChanged(onCurrentEquipmentChanged);
      taskManager.unregisterOnCurrentTaskChanged(onCurrentTaskChanged);
      taskManager.unregisterOnTasksChanged(onTasksChanged);
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
  const onClickTaskTable = useCallback((task: TaskModel) => {
    setCurrentTask(task);

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
                  <EquipmentsInfo extraClassNames={`${panelClassNames} columnHeader`} />
                  <TaskTabPanes
                    classNames={`${panelClassNames} columnBody`}
                    currentEquipment={currentEquipment}
                    taskList={taskList}
                    areTasksLoading={taskManager.areTasksLoading()}
                    changeCurrentTask={onClickTaskTable}
                    equipmentHistoryRefreshId={equipmentHistoryRefreshId}
                    onTaskChanged={taskManager.setCurrentTask}
                  />
                </div>
                <div className="wrapperColumn">
                  <CardTaskDetails
                    callBackRef={cardTaskDetailDomCallBack}
                    currentTaskIsChanging={taskManager.isCurrentTaskChanging()}
                    equipment={currentEquipment}
                    tasks={taskList}
                    currentTask={currentTask}
                    onTaskChanged={taskManager.onTaskSaved}
                    onTaskDeleted={taskManager.onTaskDeleted}
                    changeCurrentTask={taskManager.setCurrentTask}
                    classNames={`${panelClassNames} columnHeader`}
                  />
                  <HistoryTaskTable
                    equipment={currentEquipment}
                    task={currentTask}
                    onHistoryChanged={taskManager.refreshTasks}
                    taskHistoryRefreshId={taskHistoryRefreshId}
                    classNames={`${panelClassNames} columnBody lastBlock`}
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
