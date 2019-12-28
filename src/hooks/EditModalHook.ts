import { useState } from 'react';

export default function useEditModal<T>(initialData: T) {
  const [data, setData] = useState(initialData);
  const [editModalVisibility, setEditModalVisibility] = useState(false);

  const toggleModal = () => {
    setEditModalVisibility(!editModalVisibility);
  };

  const displayData = (dataToDisplay: T) => {
    setData(dataToDisplay);
    setEditModalVisibility(true);
  };

  return {
    data, editModalVisibility, toggleModal, displayData, setData,
  };
}
