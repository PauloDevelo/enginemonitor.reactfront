/* eslint-disable no-unused-vars */
import _ from 'lodash';
import userContext from './UserContext';
import analytics from '../helpers/AnalyticsHelper';

import { AssetModel, UserModel, UserCredentials } from '../types/Types';

export type AssetListener = (asset: AssetModel|undefined|null) => void;

export interface IAssetManager{
    getUserCredentials(): UserCredentials | undefined;

    getCurrentAsset(): AssetModel | undefined | null;
    setCurrentAsset(asset: AssetModel): Promise<void>;

    onAssetsChanged(assets: AssetModel[]): Promise<void>;

    registerOnCurrentAssetChanged(listener: AssetListener):void;
    unregisterOnCurrentAssetChanged(listenerToRemove: AssetListener):void;
}

class AssetManager implements IAssetManager {
    private listeners: AssetListener[] = [];

    private assets: AssetModel[]|null = [];

    private currentAsset: AssetModel|undefined|null = null;

    private credentials:UserCredentials | undefined = undefined;

    constructor() {
      userContext.registerOnUserChanged(this.onCurrentUserChanged);
    }

    onCurrentUserChanged = async (user: UserModel | undefined) => {
      if (user !== undefined) {
        const { default: assetProxy } = await import('./AssetProxy');
        await this.onAssetsChanged(await assetProxy.fetchAssets());
      } else {
        await this.onAssetsChanged(null);
      }
    }

    getCurrentAsset = (): AssetModel | undefined | null => this.currentAsset

    getUserCredentials = (): UserCredentials | undefined => this.credentials

    setCurrentAsset = async (asset: AssetModel | undefined | null, isUserInteraction: boolean = true) => {
      this.currentAsset = asset;
      await this.updateUserCredentials(this.currentAsset);
      this.listeners.map((listener) => listener(this.currentAsset));

      if (isUserInteraction) {
        analytics.selectContent('asset');
      }
    }

    onAssetsChanged = async (assets: AssetModel[] | null): Promise<void> => {
      this.assets = assets;

      let newCurrentAsset: AssetModel | undefined | null = null;
      if (this.assets !== null) {
        const currentAssetUiId = _.get(this.currentAsset, '_uiId');
        if (currentAssetUiId) {
          newCurrentAsset = _.find(this.assets, (asset) => asset._uiId === currentAssetUiId);
        } else {
          newCurrentAsset = _.first(this.assets);
        }
      }

      await this.setCurrentAsset(newCurrentAsset, false);
    }

    registerOnCurrentAssetChanged = (listener: AssetListener):void => {
      this.listeners.push(listener);
    }

    unregisterOnCurrentAssetChanged = (listenerToRemove: AssetListener):void => {
      this.listeners = this.listeners.filter((listener) => listener !== listenerToRemove);
    }

    private updateUserCredentials = async (newCurrentAsset: AssetModel | undefined | null) => {
      if (newCurrentAsset === undefined || newCurrentAsset === null) {
        this.credentials = undefined;
        return;
      }

      const { default: userProxy } = await import('./UserProxy');
      this.credentials = await userProxy.getCredentials({ assetUiId: newCurrentAsset._uiId });
    }
}

const assetManager:IAssetManager = new AssetManager();
export default assetManager;
