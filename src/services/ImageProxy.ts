// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import progressiveHttpProxy from './ProgressiveHttpProxy';
import httpProxy from './HttpProxy';
import syncService from './SyncService';
// eslint-disable-next-line no-unused-vars
import actionManager, { Action, ActionType } from './ActionManager';
import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';
import { blobToDataURL } from '../helpers/ImageHelper';

import userContext from './UserContext';

export interface FetchImagesProps{
    parentUiId: string;
    forceToLookUpInStorage?: boolean;
    cancelToken?: CancelToken | undefined;
}

export interface IImageProxy{
    fetchImages(props: FetchImagesProps): Promise<ImageModel[]>;
    createImage(imgToSave: ImageModel, image: Blob, thumbnail: Blob):Promise<ImageModel>;
    updateImage(imageToSave: ImageModel):Promise<ImageModel>;
    deleteImage(image: ImageModel): Promise<ImageModel>;

    onEntityDeleted(parentUiId: string):Promise<void>;
}

class ImageProxy implements IImageProxy {
    private baseUrl:string = `${process.env.REACT_APP_URL_BASE}images/`;

    // //////////////Equipment////////////////////////
    fetchImages = async ({ parentUiId, forceToLookUpInStorage = false, cancelToken = undefined }: FetchImagesProps): Promise<ImageModel[]> => {
      if (forceToLookUpInStorage) {
        return storageService.getArray<ImageModel>(this.baseUrl + parentUiId);
      }

      return progressiveHttpProxy.getArrayOnlineFirst<ImageModel>(this.baseUrl + parentUiId, 'images', (image) => image, cancelToken);
    }

    createImage = async (imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob):Promise<ImageModel> => {
      await storageService.setItem(imgToSave.url, await blobToDataURL(blobImage));
      await storageService.setItem(imgToSave.thumbnailUrl, await blobToDataURL(thumbnail));

      let savedImage: ImageModel;
      const createImageUrl = this.baseUrl + imgToSave.parentUiId;

      if (await syncService.isOnlineAndSynced()) {
        const { image } = await httpProxy.postImage(createImageUrl, imgToSave, blobImage, thumbnail);
        savedImage = image;
      } else {
        const action: Action = { key: createImageUrl, type: ActionType.CreateImage, data: imgToSave };
        await actionManager.addAction(action);
        savedImage = imgToSave;
        savedImage.sizeInByte = 450 * 1024;
      }

      await storageService.updateArray(createImageUrl, savedImage);
      userContext.onImageAdded(savedImage.sizeInByte);
      return savedImage;
    }

    updateImage = async (imageToSave: ImageModel):Promise<ImageModel> => {
      const updatedImage = await progressiveHttpProxy.postAndUpdate(`${this.baseUrl + imageToSave.parentUiId}/${imageToSave._uiId}`, 'image', imageToSave, (image) => image);
      await storageService.updateArray(this.baseUrl + updatedImage.parentUiId, updatedImage);
      return updatedImage;
    };

    deleteImage = async (image: ImageModel): Promise<ImageModel> => {
      await progressiveHttpProxy.deleteAndUpdate<ImageModel>(`${this.baseUrl + image.parentUiId}/${image._uiId}`, 'image', (anImage) => anImage);
      const deletedImage = await this.removeImageFromStorage(image);
      userContext.onImageRemoved(deletedImage.sizeInByte);

      return deletedImage;
    }

    onEntityDeleted = async (parentUiId: string):Promise<void> => {
      const images = await this.fetchImages({ parentUiId, forceToLookUpInStorage: true });

      await images.reduce(async (previousPromise, image) => {
        await previousPromise;
        const deletedImage = await this.removeImageFromStorage(image);
        userContext.onImageRemoved(deletedImage.sizeInByte);
      }, Promise.resolve());
    }

    private async removeImageFromStorage(image: ImageModel) {
      const deletedImage = await storageService.removeItemInArray<ImageModel>(this.baseUrl + image.parentUiId, image._uiId);
      await storageService.removeItem<ImageModel>(image.url);
      await storageService.removeItem<ImageModel>(image.thumbnailUrl);

      return deletedImage;
    }
}

const imageProxy:IImageProxy = new ImageProxy();
export default imageProxy;
