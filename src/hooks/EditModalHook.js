import { useState } from 'react';

export function useEditModal(initialData){
    const [data, setData] = useState(initialData);
    const [editModalVisibility, setEditModalVisibility] = useState(false);
    
    const toggleModal = () => {
        setEditModalVisibility(!editModalVisibility);
    }

    const displayData = (data)=>{
        setData(data);
        setEditModalVisibility(true);
    }
  
    return { data, editModalVisibility, toggleModal, displayData };
  };