import * as log from 'loglevel';
import { useRef, useEffect } from 'react';

function useTraceUpdate(componentName: string, props: any) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
      if (prev.current[k] !== v) {
        // eslint-disable-next-line no-param-reassign
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      log.debug(`${componentName} changed props:`, changedProps);
    }
    prev.current = props;
  });
}

export default useTraceUpdate;
