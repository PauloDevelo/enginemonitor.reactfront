import { useState } from 'react';

import HttpError from '../http/HttpError'

export function useEditModalLogic<T>(toggleEditModal: ()=> void, 
    equipmentMonitorServiceSaveFunc: any, saveParamsArray: any[], onSaveCallBack: ((data: T) => void) | undefined, onSavedCallBack: (data: T) => void, 
    equipmentMonitorServiceDeleteFunc: any, deleteParamsArray: any[], onDeleteCallBack: ((data: T) => void) | undefined){
	
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [alerts, setAlerts] = useState<any>(undefined);
	const [yesNoModalVisibility, setYesNoModalVisibility] = useState(false);

	const toggleModalYesNoConfirmation = () => {
		setYesNoModalVisibility(!yesNoModalVisibility);
	}

	const cancel = () => {
		setAlerts(undefined);
		toggleEditModal();
	}

	const handleSubmit = async(data: T) => {
		setIsSaving(true);
        if(onSaveCallBack)
            onSaveCallBack(data);

		try{
			const savedData = await equipmentMonitorServiceSaveFunc.apply(null, saveParamsArray.concat(data));
			onSavedCallBack(savedData);
			setAlerts(undefined);
			toggleEditModal();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
            }
            else{
                console.log(error);
            }
		}
		setIsSaving(false);
	}
	
	const handleDelete = () => {
		setYesNoModalVisibility(true);
	}

	const yesDelete = async() => {
		setIsDeleting(true);
		try{
			const deletedData = await equipmentMonitorServiceDeleteFunc.apply(null, deleteParamsArray);
			if(onDeleteCallBack !== undefined){
				onDeleteCallBack(deletedData);
			}
            setAlerts(undefined);
            toggleModalYesNoConfirmation();
			toggleEditModal();
		}
		catch(error){
			if(error instanceof HttpError){
                setAlerts(error.data);
            }
            else{
                console.log(error);
            }
		}
		setIsDeleting(false);
    }
    
    return {alerts, cancel, handleSubmit, handleDelete, yesDelete, yesNoModalVisibility, toggleModalYesNoConfirmation, isSaving, isDeleting};
  };