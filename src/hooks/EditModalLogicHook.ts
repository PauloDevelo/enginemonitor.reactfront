import { useState } from 'react';

import HttpError from '../http/HttpError'

export function useEditModalLogic<T>(toggleEditModal: ()=> void, 
    equipmentMonitorServiceSaveFunc: any, saveParamsArray: any[], onSaveCallBack: ((data: T) => void) | undefined, onSavedCallBack: (data: T) => void, 
    equipmentMonitorServiceDeleteFunc: any, deleteParamsArray: any[], onDeleteCallBack: ((data: T) => void) | undefined){
	
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
	}
	
	const handleDelete = () => {
		setYesNoModalVisibility(true);
	}

	const yesDelete = async() => {
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
    }
    
    return {alerts, cancel, handleSubmit, handleDelete, yesDelete, yesNoModalVisibility, toggleModalYesNoConfirmation};
  };