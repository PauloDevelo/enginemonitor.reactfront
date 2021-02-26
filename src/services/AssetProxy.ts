/* eslint-disable no-unused-vars */
import * as log from 'loglevel';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import storageService from './StorageService';
import assetManager from './AssetManager';

import equipmentProxy from './EquipmentProxy';

import { updateAsset } from '../helpers/AssetHelper';
import { AssetModel, extractAssetModel } from '../types/Types';
import imageProxy from './ImageProxy';
import userContext from './UserContext';
import HttpError from '../http/HttpError';

export interface FetchAssetProp{
  cancelTimeout?: boolean;
  forceToLookUpInStorage?: boolean;
}

export interface IAssetProxy{
    sendOwnershipInvitation(asset: AssetModel, newOwnerEmail: string): Promise<string>;
    fetchAssets(props?: FetchAssetProp): Promise<AssetModel[]>;
    createOrSaveAsset(assetToSave: AssetModel):Promise<AssetModel>;
    deleteAsset(idAsset: string): Promise<AssetModel>;

    getStoredAsset():Promise<AssetModel[]>;

    existAsset(assetId: string | undefined):Promise<boolean>;
}

class AssetProxy implements IAssetProxy {
    private baseUrl:string = `${process.env.REACT_APP_API_URL_BASE}assets/`;

    // //////////////Equipment////////////////////////
    sendOwnershipInvitation = async (asset: AssetModel, newOwnerEmail: string): Promise<string> => progressiveHttpProxy.postAndUpdateOnlyOnline<string>(`${this.baseUrl}changeownership/${asset._uiId}`, 'newOwnerEmail', newOwnerEmail, undefined, true)

    fetchAssets = async ({ cancelTimeout, forceToLookUpInStorage }: FetchAssetProp = { cancelTimeout: false, forceToLookUpInStorage: false }): Promise<AssetModel[]> => {
      if (forceToLookUpInStorage) {
        return progressiveHttpProxy.getArrayFromStorage({ url: this.baseUrl, init: updateAsset });
      }

      return progressiveHttpProxy.getArrayOnlineFirst<AssetModel>({
        url: this.baseUrl, keyName: 'assets', init: updateAsset, cancelTimeout,
      });
    }

    createOrSaveAsset = async (assetToSave: AssetModel):Promise<AssetModel> => {
      this.checkAssetCreationCredential();
      const updatedAsset = await progressiveHttpProxy.postAndUpdate<AssetModel>(this.baseUrl + assetToSave._uiId, 'asset', extractAssetModel(assetToSave), updateAsset, false);
      const updatedAssets = await storageService.updateArray(this.baseUrl, updatedAsset);
      await assetManager.onAssetsChanged(updatedAssets);
      return updatedAsset;
    }

    deleteAsset = async (idAsset: string): Promise<AssetModel> => {
      await progressiveHttpProxy.delete<AssetModel>(this.baseUrl + idAsset);

      await equipmentProxy.onAssetDeleted(idAsset);
      await imageProxy.onEntityDeleted(idAsset);

      const deletedAsset = await storageService.removeItemInArray<AssetModel>(this.baseUrl, idAsset);

      await assetManager.onAssetsChanged(await this.getStoredAsset());

      return updateAsset(deletedAsset);
    }

    getStoredAsset = async ():Promise<AssetModel[]> => this.fetchAssets({ forceToLookUpInStorage: true })

    existAsset = async (assetId: string | undefined):Promise<boolean> => {
      if (assetId === undefined) {
        log.error('The function AssetProxy.existAsset expects a non null and non undefined asset id.');
        return false;
      }

      const allAssets = await this.getStoredAsset();
      return allAssets.findIndex((asset) => asset._uiId === assetId) !== -1;
    }

    private checkAssetCreationCredential = () => {
      const user = userContext.getCurrentUser();
      if (user === undefined || user.forbidCreatingAsset === undefined || user.forbidCreatingAsset) {
        throw new HttpError({ message: 'credentialError' });
      }
    }
}

const assetProxy:IAssetProxy = new AssetProxy();
export default assetProxy;
