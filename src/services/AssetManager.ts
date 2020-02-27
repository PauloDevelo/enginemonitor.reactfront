import userContext from './UserContext';

// eslint-disable-next-line no-unused-vars
import { AssetModel, UserModel, UserCredentials } from '../types/Types';

export interface IAssetManager{
    getUserCredentials(): UserCredentials | undefined;
    getCurrentAsset(): AssetModel | undefined;
    setCurrentAsset(asset: AssetModel): Promise<void>;

    onAssetsChanged(assets: AssetModel[]): Promise<void>;

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
        await this.onAssetsChanged(await assetProxy.fetchAssets());
      } else {
        await this.onAssetsChanged([]);
      }
    }

    getCurrentAsset(): AssetModel | undefined {
      return this.currentAsset;
    }

    getUserCredentials(): UserCredentials | undefined {
      return this.credentials;
    }

    async setCurrentAsset(asset: AssetModel | undefined) {
      this.currentAsset = asset;
      await this.updateUserCredentials(this.currentAsset);
      this.listeners.map((listener) => listener(this.currentAsset));
    }

    async onAssetsChanged(assets: AssetModel[]): Promise<void> {
      this.assets = assets;
      await this.setCurrentAsset(this.assets.length > 0 ? this.assets[0] : undefined);
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
