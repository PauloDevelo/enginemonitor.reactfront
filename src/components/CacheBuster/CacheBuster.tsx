import React, { useState, useEffect } from 'react';
import appVersion from '../../global';

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

const CacheBuster = (props: any) => {
  const [state, setState] = useState({
    loading: true,
    isLatestVersion: false,
  });

  const refreshCacheAndReload = async(): Promise<void> => {
    console.log('Clearing cache and hard reloading...')
    if (caches) {
      // Service worker cache should be cleared with caches.delete()
      const names = await caches.keys();
      for (let name of names) {
        console.log("delete " + name);
        await caches.delete(name);
      }
    }

    console.log("hard reload");
    window.location.reload(true);
  }

  useEffect(() => {
    fetch('/meta.json', {cache: "no-store"})
    .then((response) => response.json())
    .then((meta) => {
      const latestVersion = meta.version;
      const currentVersion = appVersion;

      const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
      if (shouldForceRefresh) {
        console.log(`We have a new version - ${latestVersion}. Should force refresh`);
        setState({ loading: false, isLatestVersion: false });
      } else {
        console.log(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
        setState({ loading: false, isLatestVersion: true });
      }
    })
    .catch((error)=>{
      console.error(error);
      setState({ loading: false, isLatestVersion: true });
    });
  }, []);

  return props.children({ loading:state.loading, isLatestVersion:state.isLatestVersion, refreshCacheAndReload });
  
}

export default CacheBuster;