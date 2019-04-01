import { useState } from 'react';

export function useEditModal<T>(initialData: T){
    const [data, setData] = useState(initialData);
    const [editModalVisibility, setEditModalVisibility] = useState(false);
    
    const toggleModal = () => {
        setEditModalVisibility(!editModalVisibility);
    }

    const displayData = (data: T)=>{
        setData(data);
        setEditModalVisibility(true);
    }
  
    return { data, editModalVisibility, toggleModal, displayData, setData };
  };