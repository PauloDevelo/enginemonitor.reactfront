import { useRef, useCallback, useEffect } from 'react';

import {useAsync, AsyncState} from 'react-async';
import httpProxy from '../services/HttpProxy';
import { CancelTokenSource } from 'axios';

export type AxiosAsyncProps<T, P> = {
    fetchPromise: (props:P) => Promise<T>,
    fetchProps: P,
    cancellationMsg?: string
}

export type FetcherState<T> = {
    data: T | undefined,
    error: undefined | Error,
    isLoading: boolean,
    reloadRef: React.MutableRefObject<() => void>
}

export function useFetcher<T, P>({ fetchPromise, fetchProps, cancellationMsg}:AxiosAsyncProps<T, P>):FetcherState<T> {
    const cancelTokenSourceRef = useRef<CancelTokenSource | undefined>(undefined);
    const cancelFetchImages = useCallback(() => {
        if (cancelTokenSourceRef.current){
            cancelTokenSourceRef.current.cancel(cancellationMsg);
        }
    }, []);

    const fetch = useCallback(async() => {
        cancelTokenSourceRef.current = httpProxy.createCancelTokenSource();
        const extendedFetchProps = Object.assign({cancelToken: cancelTokenSourceRef.current.token}, fetchProps);

        return fetchPromise(extendedFetchProps);
    }, Object.values(fetchProps));

    const {data, error, isLoading, reload} = useAsync({ promiseFn: fetch, onCancel: cancelFetchImages });

    const reloadRef = useRef(reload);
    useEffect(() => {
        reloadRef.current = reload;
    }, [reload]);

    return {data, error, isLoading, reloadRef};
}