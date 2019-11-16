/* eslint-disable max-len */
import * as log from 'loglevel';
import { useState } from 'react';

import HttpError from '../http/HttpError';

export default function useEditModalLogic<T>(toggleEditModal: ()=> void,
  save: any, saveParams: any[], onSaveCb: ((data: T) => void) | undefined, onSavedCb: (data: T) => void,
  deleteFunc: any, deleteParams: any[], onDeleteCallBack: ((data: T) => void) | undefined) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alerts, setAlerts] = useState<any>(undefined);
  const [yesNoModalVisibility, setYesNoModalVisibility] = useState(false);

  const toggleModalYesNoConfirmation = () => {
    setYesNoModalVisibility(!yesNoModalVisibility);
  };

  const cancel = () => {
    setAlerts(undefined);
    toggleEditModal();
  };

  const handleSubmit = async (data: T) => {
    setIsSaving(true);
    if (onSaveCb) { onSaveCb(data); }

    try {
      const savedData = await save(...saveParams.concat(data));
      onSavedCb(savedData);
      setAlerts(undefined);
      toggleEditModal();
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
      toggleEditModal();
    } catch (error) {
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
