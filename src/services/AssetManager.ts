import userContext from './UserContext';

// eslint-disable-next-line no-unused-vars
import { AssetModel, UserModel, UserCredentials } from '../types/Types';

export interface IAssetManager{
    getUserCredentials(): UserCredentials | undefined;
    getCurrentAsset(): AssetModel | undefined;
    setCurrentAsset(asset: AssetModel): void;

    onAssetsChanged(assets: AssetModel[]): void;

    registerOnCurrentAssetChanged(listener: (asset: AssetModel|undefined) => void):void;
    unregisterOnCurrentAssetChanged(listenerToRemove: (asset: AssetModel|undefined) => void):void;
}

class AssetManager implements IAssetManager {
    private listeners: ((asset: AssetModel | undefined) => void)[] = [];

    private assets: AssetModel[] = [];

    private currentAsset: AssetModel|undefined = undefined;

    private credentials:UserCredentials | undefined = undefined;

    constructor() {
      userContext.registerOnUserChanged(this.onCurrentUserChanged);
    }

    // eslint-disable-next-line no-unused-vars
    onCurrentUserChanged = async (user: UserModel | undefined) => {
      if (user !== undefined) {
        const { default: assetProxy } = await import('./AssetProxy');
        this.onAssetsChanged(await assetProxy.fetchAssets());
      } else {
        this.onAssetsChanged([]);
      }
    }

    getCurrentAsset(): AssetModel | undefined {
      return this.currentAsset;
    }

    getUserCredentials(): UserCredentials | undefined {
      return this.credentials;
    }

    setCurrentAsset(asset: AssetModel | undefined) {
      this.currentAsset = asset;
      this.updateUserCredentials(this.currentAsset);
      this.listeners.map((listener) => listener(this.currentAsset));
    }

    onAssetsChanged(assets: AssetModel[]): void{
      this.assets = assets;
      this.setCurrentAsset(this.assets.length > 0 ? this.assets[0] : undefined);
    }

    registerOnCurrentAssetChanged(listener: (asset: AssetModel|undefined) => void):void{
      this.listeners.push(listener);
    }

    unregisterOnCurrentAssetChanged(listenerToRemove: (asset: AssetModel|undefined) => void):void{
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    private updateUserCredentials = async (newCurrentAsset: AssetModel | undefined) => {
      if (newCurrentAsset === undefined) {
        this.credentials = undefined;
        return;
      }

      const { default: userProxy } = await import('./UserProxy');
      this.credentials = await userProxy.getCredentials({ assetUiId: newCurrentAsset._uiId });
    }
}

const assetManager:IAssetManager = new AssetManager();
export default assetManager;
