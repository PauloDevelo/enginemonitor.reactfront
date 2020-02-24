import * as log from 'loglevel';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';
import assetManager from './AssetManager';

import equipmentProxy from './EquipmentProxy';

import { updateAsset } from '../helpers/AssetHelper';
// eslint-disable-next-line no-unused-vars
import { AssetModel } from '../types/Types';
import imageProxy from './ImageProxy';

export interface IAssetProxy{
    fetchAssets(): Promise<AssetModel[]>;
    createOrSaveAsset(assetToSave: AssetModel):Promise<AssetModel>;
    deleteAsset(idAsset: string): Promise<AssetModel>;

    getStoredAsset():Promise<AssetModel[]>;

    existAsset(assetId: string | undefined):Promise<boolean>;
}

class AssetProxy implements IAssetProxy {
    private baseUrl:string = `${process.env.REACT_APP_API_URL_BASE}assets/`;

    // //////////////Equipment////////////////////////
    fetchAssets = async (forceToLookUpInStorage: boolean = false): Promise<AssetModel[]> => {
      if (forceToLookUpInStorage) {
        return progressiveHttpProxy.getArrayFromStorage(this.baseUrl, updateAsset);
      }

      return progressiveHttpProxy.getArrayOnlineFirst<AssetModel>(this.baseUrl, 'assets', updateAsset);
    }

    createOrSaveAsset = async (assetToSave: AssetModel):Promise<AssetModel> => {
      const updatedAsset = await progressiveHttpProxy.postAndUpdate<AssetModel>(this.baseUrl + assetToSave._uiId, 'asset', assetToSave, updateAsset);
      const updatedAssets = await storageService.updateArray(this.baseUrl, updatedAsset);
      assetManager.onAssetsChanged(updatedAssets);
      return updatedAsset;
    }

    deleteAsset = async (idAsset: string): Promise<AssetModel> => {
      await progressiveHttpProxy.deleteAndUpdate<AssetModel>(this.baseUrl + idAsset, 'asset', updateAsset);

      await equipmentProxy.onAssetDeleted(idAsset);
      await imageProxy.onEntityDeleted(idAsset);

      const deletedAsset = await storageService.removeItemInArray<AssetModel>(this.baseUrl, idAsset);

      assetManager.onAssetsChanged(await this.getStoredAsset());

      return updateAsset(deletedAsset);
    }

    getStoredAsset = async ():Promise<AssetModel[]> => this.fetchAssets(true)

    existAsset = async (assetId: string | undefined):Promise<boolean> => {
      if (assetId === undefined) {
        log.error('The function AssetProxy.existAsset expects a non null and non undefined asset id.');
        return false;
      }

      const allAssets = await this.getStoredAsset();
      return allAssets.findIndex((asset) => asset._uiId === assetId) !== -1;
    }
}

const assetProxy:IAssetProxy = new AssetProxy();
export default assetProxy;
