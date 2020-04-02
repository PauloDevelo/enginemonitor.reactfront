// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import progressiveHttpProxy from './ProgressiveHttpProxy';

// eslint-disable-next-line no-unused-vars
import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';
import { blobToDataURL } from '../helpers/ImageHelper';

import userContext from './UserContext';

export interface FetchImagesProps{
    parentUiId: string;
    forceToLookUpInStorage?: boolean;
    checkStorageFirst? : boolean;
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
    private baseUrl:string = `${process.env.REACT_APP_API_URL_BASE}images/`;

    // //////////////Equipment////////////////////////
    fetchImages = async ({
      parentUiId, forceToLookUpInStorage = false, checkStorageFirst = false, cancelToken = undefined,
    }: FetchImagesProps): Promise<ImageModel[]> => {
      if (forceToLookUpInStorage) {
        return storageService.getArray<ImageModel>(this.baseUrl + parentUiId);
      }

      if (checkStorageFirst) {
        if (await storageService.existItem(this.baseUrl + parentUiId)) {
          return storageService.getArray<ImageModel>(this.baseUrl + parentUiId);
        }
      }

      return progressiveHttpProxy.getArrayOnlineFirst<ImageModel>(this.baseUrl + parentUiId, 'images', (image) => image, cancelToken);
    }

    createImage = async (imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob):Promise<ImageModel> => {
      await storageService.setItem(imgToSave.url, await blobToDataURL(blobImage));
      await storageService.setItem(imgToSave.thumbnailUrl, await blobToDataURL(thumbnail));

      const createImageUrl = this.baseUrl + imgToSave.parentUiId;

      const savedImage: ImageModel = await progressiveHttpProxy.postNewImage(createImageUrl, imgToSave, blobImage, thumbnail);

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
