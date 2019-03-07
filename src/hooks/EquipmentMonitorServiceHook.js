import { useState, useEffect } from 'react';

import EquipmentMonitorService from '../services/EquipmentMonitorServiceProxy';

export function useEquipmentMonitorService(initialData, equipmentMonitorFetchMethod, arrayInitialParams, onDataChangedCallBack){
    const [data, setData] = useState(initialData);
    const [params, setParams] = useState(arrayInitialParams);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const changeData = (newData) => {
      setData(newData);
      if(onDataChangedCallBack){
          onDataChangedCallBack(newData);
      }
    };
  
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
  
      try {
        const result = await equipmentMonitorFetchMethod.apply(EquipmentMonitorService, params);
        changeData(result);
      } catch (error) {
        setIsError(true);
      }
  
      setIsLoading(false);
    };

    useEffect(() => {
      fetchData();
    }, params);
  
    const doFetch = (arrayParam) => {
      if(arrayParam.length === 0){
        fetchData();
      }
      else{
        setParams(arrayParam);
      }
    };
  
    return { data, isLoading, isError, doFetch, changeData };
  };