import assetProxy from './AssetProxy';

import userContext from './UserContext';

// eslint-disable-next-line no-unused-vars
import { AssetModel, UserModel } from '../types/Types';

export interface IAssetManager{
    getCurrentAsset(): AssetModel | undefined;
    setCurrentAsset(asset: AssetModel): void;

    registerOnCurrentAssetChanged(listener: (asset: AssetModel) => void):void;
    unregisterOnCurrentAssetChanged(listenerToRemove: (asset: AssetModel) => void):void;
}

class AssetManager implements IAssetManager {
    private listeners: ((asset: AssetModel | undefined) => void)[] = [];

    private assets: AssetModel[] = [];

    private currentAsset: AssetModel|undefined = undefined;

    constructor() {
      userContext.registerOnUserChanged(this.onCurrentUserChanged);
    }

    // eslint-disable-next-line no-unused-vars
    onCurrentUserChanged = async (_user: UserModel | undefined) => {
      this.assets = await assetProxy.fetchAssets();
      this.setCurrentAsset(this.assets.length > 0 ? this.assets[0] : undefined);
    }

    getCurrentAsset(): AssetModel | undefined {
      return this.currentAsset;
    }

    setCurrentAsset(asset: AssetModel | undefined) {
      this.currentAsset = asset;
      this.listeners.map((listener) => listener(this.currentAsset));
    }

    registerOnCurrentAssetChanged(listener: (asset: AssetModel) => void):void{
      this.listeners.push(listener);
    }

    unregisterOnCurrentAssetChanged(listenerToRemove: (asset: AssetModel) => void):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }
}

const assetManager:IAssetManager = new AssetManager();
export default assetManager;
