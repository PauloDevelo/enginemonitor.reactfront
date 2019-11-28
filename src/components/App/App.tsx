import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';

import { CSSTransition } from 'react-transition-group';
import { scrollTo } from '../../helpers/Helpers';

import TaskTabPanes from '../TaskTabPanes/TaskTabPanes';
import EquipmentsInfo from '../EquipmentInfo/EquipmentsInfo';
import HistoryTaskTable from '../HistoryTaskTable/HistoryTaskTable';
import CardTaskDetails from '../CardTaskDetails/CardTaskDetails';
import ModalLogin from '../ModalLogin/ModalLogin';
import ModalSignup from '../ModalSignup/ModalSignup';
import NavBar from '../NavBar/NavBar';
import SyncAlert from '../SyncAlert/SyncAlert';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import CacheBuster from '../CacheBuster/CacheBuster';

import userProxy from '../../services/UserProxy';
import taskProxy from '../../services/TaskProxy';
import errorService from '../../services/ErrorService';

import '../../style/transition.css';
import './App.css';

// eslint-disable-next-line no-unused-vars
import { UserModel, EquipmentModel, TaskModel } from '../../types/Types';

import useFetcher from '../../hooks/Fetcher';

export default function App() {
  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const onListErrorChanged = (errors: Error[]) => {
    if (errors.length > 0) {
      setError(errors[errors.length - 1]);
    } else {
      setError(undefined);
    }
  };

  useEffect(() => {
    const refreshCurrentUser = async () => {
      try {
        const currentUser = await userProxy.fetchCurrentUser();
        setUser(currentUser);
      } catch (reason) {
        setUser(undefined);
      }
    };

    refreshCurrentUser();
    errorService.registerOnListErrorChanged(onListErrorChanged);

    return () => {
      errorService.unregisterOnListErrorChanged(onListErrorChanged);
    };
  }, []);


  const dismissError = useCallback(() => {
    if (error !== undefined) {
      errorService.removeError(error);
    }
  }, [error]);

  const [currentEquipment, setCurrentEquipment] = useState<EquipmentModel | undefined>(undefined);
  const currentEquipmentId = currentEquipment ? currentEquipment._uiId : undefined;

  const [taskList, setTaskList] = useState<TaskModel[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskModel | undefined>(undefined);
  const [currentTaskIsChanging, setCurrentTaskIsChanging] = useState(false);

  const [taskHistoryRefreshId, setTaskHistoryRefreshId] = useState(0);
  const [equipmentHistoryRefreshId, setEquipmentHistoryRefreshId] = useState(0);

  const { data: fetchedTasks, isLoading, reloadRef: reloadTasksRef } = useFetcher({ fetchPromise: taskProxy.fetchTasks, fetchProps: { equipmentId: currentEquipmentId }, cancellationMsg: 'Cancellation of tasks fetching' });

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
            <CSSTransition in appear timeout={1000} classNames="fade">
              <>
                <NavBar onLoggedOut={logOut} />
                <div className="appBody mb-2">
                  <div className="wrapperColumn">
                    <EquipmentsInfo
                      userId={user ? user._uiId : undefined}
                      changeCurrentEquipment={setCurrentEquipment}
                      extraClassNames={`${panelClassNames} columnHeader`}
                    />
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
                <SyncAlert className="bottomright" />
                <ErrorAlert error={error} onDismiss={dismissError} className="bottomright" />
              </>
            </CSSTransition>
            {!user && (
            <ModalLogin
              visible={!user}
              onLoggedIn={setUser}
              className="modal-dialog-centered"
              toggleModalSignup={toggleModalSignup}
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
