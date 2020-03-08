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
import taskProxy from '../../services/TaskProxy';
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

import useFetcher from '../../hooks/Fetcher';
import ModalEditAsset from '../ModalEditAsset/ModalEditAsset';
import equipmentManager from '../../services/EquipmentManager';

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

  const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(undefined);
  const currentEquipmentId = currentEquipment ? currentEquipment._uiId : undefined;

  useEffect(() => {
    const onCurrentAssetChanged = (asset: AssetModel|undefined) => {
      setCurrentAsset(asset);
    };

    const onCurrentEquipmentChanged = (equipment: EquipmentModel | undefined) => {
      setCurrentEquipment(equipment);
    };

    assetManager.registerOnCurrentAssetChanged(onCurrentAssetChanged);
    equipmentManager.registerOnCurrentEquipmentChanged(onCurrentEquipmentChanged);

    return () => {
      assetManager.unregisterOnCurrentAssetChanged(onCurrentAssetChanged);
      equipmentManager.unregisterOnCurrentEquipmentChanged(onCurrentEquipmentChanged);
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


  const [taskList, setTaskList] = useState<TaskModel[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskModel | undefined>(undefined);
  const [currentTaskIsChanging, setCurrentTaskIsChanging] = useState(false);

  const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);
  const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);

  const { data: fetchedTasks, isLoading, reloadRef: reloadTasksRef } = useFetcher({ fetchPromise: taskProxy.fetchTasks, fetchProps: { equipmentId: currentEquipmentId }, cancellationMsg: `Cancellation of ${currentEquipment?.name} tasks fetching` });

  useEffect(() => {
    setCurrentTaskIsChanging(true);
  }, [currentEquipment]);

  useEffect(() => {
    if (fetchedTasks) {
      fetchedTasks.sort((taskA, taskB) => {
        if (taskB.level === taskA.level) {
          return taskA.nextDueDate.getTime() - taskB.nextDueDate.getTime();
        }

        return taskB.level - taskA.level;
      });
    }

    setTaskList(fetchedTasks || []);
  }, [fetchedTasks]);

  const setCurrentTaskIfRequired = useCallback(() => {
    setCurrentTask((previousCurrentTask) => {
      if (taskList.length === 0) {
        return undefined;
      }
      let newCurrentTask;
      const previousCurrentTaskId = previousCurrentTask !== undefined ? previousCurrentTask._uiId : undefined;
      if (previousCurrentTaskId) {
        newCurrentTask = taskList.find((t) => t._uiId === previousCurrentTaskId);
      }

      if (newCurrentTask === undefined) {
        newCurrentTask = taskList[0];
      }
      return newCurrentTask;
    });
  }, [taskList]);

  useEffect(() => {
    setCurrentTaskIfRequired();
  }, [setCurrentTaskIfRequired]);

  useEffect(() => {
    setCurrentTaskIsChanging(false);
  }, [currentTask]);

  const cardTaskDetailDomRef = useRef(null);
  const cardTaskDetailDomCallBack = useCallback((node) => { cardTaskDetailDomRef.current = node; }, []);
  const onClickTaskTable = useCallback((task: TaskModel) => {
    setCurrentTask(task);

    if (cardTaskDetailDomRef.current != null) {
      scrollTo((cardTaskDetailDomRef!.current! as any).offsetLeft, (cardTaskDetailDomRef!.current! as any).offsetTop, 250);
    }
  }, []);

  // eslint-disable-next-line no-unused-vars
  const onTaskDeleted = useCallback((task: TaskModel) => {
    reloadTasksRef.current();
    setEquipmentHistoryRefreshId((previousEquipmentHistoryRefreshId) => previousEquipmentHistoryRefreshId + 1);
  }, [reloadTasksRef]);

  const onTaskChanged = useCallback((task: TaskModel) => {
    reloadTasksRef.current();

    const currentTaskId = currentTask ? currentTask._uiId : undefined;
    if (task._uiId === currentTaskId) {
      setTaskHistoryRefreshId((previousTaskHistoryRefreshId) => previousTaskHistoryRefreshId + 1);
    } else {
      setCurrentTask(task);
    }
  }, [currentTask, reloadTasksRef]);

  const onTaskHistoryChanged = useCallback(() => {
    reloadTasksRef.current();
    setEquipmentHistoryRefreshId((previousEquipmentHistoryRefreshId) => previousEquipmentHistoryRefreshId + 1);
  }, [reloadTasksRef]);

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
                    areTasksLoading={isLoading}
                    changeCurrentTask={onClickTaskTable}
                    equipmentHistoryRefreshId={equipmentHistoryRefreshId}
                    onTaskChanged={onTaskChanged}
                  />
                </div>
                <div className="wrapperColumn">
                  <CardTaskDetails
                    callBackRef={cardTaskDetailDomCallBack}
                    currentTaskIsChanging={currentTaskIsChanging}
                    equipment={currentEquipment}
                    tasks={taskList}
                    currentTask={currentTask}
                    onTaskChanged={onTaskChanged}
                    onTaskDeleted={onTaskDeleted}
                    changeCurrentTask={setCurrentTask}
                    classNames={`${panelClassNames} columnHeader`}
                  />
                  <HistoryTaskTable
                    equipment={currentEquipment}
                    task={currentTask}
                    onHistoryChanged={onTaskHistoryChanged}
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
