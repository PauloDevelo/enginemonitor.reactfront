import { v4 as uuidv4 } from 'uuid';

import { AssetModel } from '../types/Types';
import timeService from '../services/TimeService';

export function createDefaultAsset(): AssetModel {
  const uuid = uuidv4();

  return {
    _uiId: uuid,
    name: '',
    brand: '',
    modelBrand: '',
    manufactureDate: timeService.getUTCDateTime(),
  };
}

export function updateAsset(asset: AssetModel): AssetModel {
  const updatedAsset = { ...asset, manufactureDate: new Date(asset.manufactureDate) };
  return updatedAsset;
}
