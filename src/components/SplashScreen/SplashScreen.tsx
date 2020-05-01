import React, { useState, useEffect } from 'react';

import userContext from '../../services/UserContext';
import assetManager from '../../services/AssetManager';

// eslint-disable-next-line no-unused-vars
import { UserModel, AssetModel } from '../../types/Types';

import { ReactComponent as Engine } from './Engine.svg';

import './SplashScreen.css';

const SpashScreen = () => {
  const [user, setUser] = useState<null | undefined | UserModel>(null);
  const [currentAsset, setCurrentAsset] = useState<AssetModel | undefined | null>(null);


  useEffect(() => {
    const asyncSetUser = async (newUser: UserModel | undefined) => {
      setUser(newUser);
    };
    userContext.registerOnUserChanged(asyncSetUser);

    assetManager.registerOnCurrentAssetChanged(setCurrentAsset);

    return () => {
      userContext.unregisterOnUserChanged(asyncSetUser);
      assetManager.unregisterOnCurrentAssetChanged(setCurrentAsset);
    };
  }, []);

  if (user !== undefined && currentAsset === null) {
    return (
      <div className="overlay">
        <Engine />
      </div>
    );
  }

  return (<></>);
};

export default SpashScreen;
