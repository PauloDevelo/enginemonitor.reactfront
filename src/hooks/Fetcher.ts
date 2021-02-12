import { useRef, useCallback, useEffect } from 'react';

import { useAsync } from 'react-async';
// eslint-disable-next-line no-unused-vars
import { CancelTokenSource } from 'axios';
import httpProxy from '../services/HttpProxy';

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

export default function useFetcher<T, P>({ fetchPromise, fetchProps, cancellationMsg }:AxiosAsyncProps<T, P>):FetcherState<T> {
  const cancelTokenSourceRef = useRef<CancelTokenSource | undefined>(undefined);
  const cancelFetching = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel(cancellationMsg);
    }
  }, [cancelTokenSourceRef, cancellationMsg]);

  const fetch = useCallback(async () => {
    cancelTokenSourceRef.current = httpProxy.createCancelTokenSource();
    const extendedFetchProps = { cancelToken: cancelTokenSourceRef.current.token, ...fetchProps };

    return fetchPromise(extendedFetchProps);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPromise, cancelTokenSourceRef, ...Object.values(fetchProps)]);

  const {
    data, error, isLoading, reload,
  } = useAsync({ promiseFn: fetch, onCancel: cancelFetching });

  const reloadRef = useRef(reload);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  return {
    data, error, isLoading, reloadRef,
  };
}
