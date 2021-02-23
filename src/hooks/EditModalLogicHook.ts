/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import * as log from 'loglevel';
import { useState } from 'react';

import HttpError from '../http/HttpError';

type ModalLogicProps<T> = {
  toggleEditModal?: ()=> void;

  saveFunc: (...params:any) => Promise<T>;
  saveParams: (any|undefined)[];
  onSaveCb?: ((data: T) => void);
  onSavedCb?: (data: T) => void;

  deleteFunc: (...params:any) => Promise<T>;
  deleteParams: (any|undefined)[];
  onDeleteCallBack?: (data: T) => void;
}

export default function useEditModalLogic<T>({
  toggleEditModal,
  saveFunc, saveParams, onSaveCb, onSavedCb,
  deleteFunc, deleteParams, onDeleteCallBack,
}: ModalLogicProps<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alerts, setAlerts] = useState<any>(undefined);
  const [yesNoModalVisibility, setYesNoModalVisibility] = useState(false);

  const toggleModalYesNoConfirmation = () => {
    setYesNoModalVisibility(!yesNoModalVisibility);
  };

  const cancel = () => {
    setAlerts(undefined);
    if (toggleEditModal) toggleEditModal();
  };

  const handleSubmit = async (data: T) => {
    setIsSaving(true);
    if (onSaveCb) { onSaveCb(data); }

    try {
      const paramsValues = saveParams.concat(data);
      const savedData = await saveFunc(...paramsValues);
      if (onSavedCb) onSavedCb(savedData);
      setAlerts(undefined);
      if (toggleEditModal) toggleEditModal();
    } catch (error) {
      if (error instanceof HttpError) {
        setAlerts(error.data);
      } else {
        log.error(error);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = () => {
    setYesNoModalVisibility(true);
  };

  const yesDelete = async () => {
    setIsDeleting(true);
    try {
      const deletedData = await deleteFunc(...deleteParams);
      if (onDeleteCallBack !== undefined) {
        onDeleteCallBack(deletedData);
      }
      setAlerts(undefined);
      toggleModalYesNoConfirmation();
      if (toggleEditModal) toggleEditModal();
    } catch (error) {
      toggleModalYesNoConfirmation();
      if (error instanceof HttpError) {
        setAlerts(error.data);
      } else {
        log.error(error);
      }
    }
    setIsDeleting(false);
  };

  return {
    alerts,
    cancel,
    handleSubmit,
    handleDelete,
    yesDelete,
    yesNoModalVisibility,
    toggleModalYesNoConfirmation,
    isSaving,
    isDeleting,
  };
}
