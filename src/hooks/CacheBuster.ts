import * as log from 'loglevel';
import { useState, useEffect } from 'react';
import global from '../global';

// version from response - first param, local version second param
const semverGreaterThan = (versionA: string, versionB: string): boolean => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

export const refreshCacheAndReload = async (): Promise<void> => {
  log.info('Clearing cache and hard reloading...');
  if (caches) {
    // Service worker cache should be cleared with caches.delete()
    const names = await caches.keys();

    const deletionsPromise:Promise<boolean>[] = [];
    names.forEach((name) => {
      log.info(`delete ${name}`);
      deletionsPromise.push(caches.delete(name));
    });

    await Promise.all(deletionsPromise);
  }

  log.info('hard reload');
  window.location.reload(true);
};

const useCacheBuster = () => {
  const [state, setState] = useState({
    loading: true,
    isLatestVersion: false,
  });

  useEffect(() => {
    fetch('/meta.json', { cache: 'no-store' })
      .then((response) => response.json())
      .then((meta) => {
        const latestVersion = meta.version;
        const currentVersion = global.getAppVersion();

        const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
        if (shouldForceRefresh) {
          log.info(`We have a new version - ${latestVersion}. Should force refresh`);
          setState({ loading: false, isLatestVersion: false });
        } else {
          log.info(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
          setState({ loading: false, isLatestVersion: true });
        }
      })
      .catch((error) => {
        log.error(error);
        setState({ loading: false, isLatestVersion: true });
      });
  }, []);

  useEffect(() => {
    if (!state.loading && !state.isLatestVersion) {
      // You can decide how and when you want to force reload
      refreshCacheAndReload();
    }
  }, [state]);

  return { loading: state.loading, isLatestVersion: state.isLatestVersion };
};

export default useCacheBuster;
