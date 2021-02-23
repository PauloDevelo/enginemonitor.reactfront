/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import _ from 'lodash';
import progressiveHttpProxy from './ProgressiveHttpProxy';

import analytics from '../helpers/AnalyticsHelper';

// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from './StorageService';

// eslint-disable-next-line no-unused-vars
import { ImageModel, extractImageModel } from '../types/Types';
import { blobToDataURL } from '../helpers/ImageHelper';

import userContext from './UserContext';

export interface FetchImagesProps{
    parentUiId: string;
    forceToLookUpInStorage?: boolean;
    checkStorageFirst? : boolean;
    cancelToken?: CancelToken | undefined;
    cancelTimeout?: boolean;
}

export interface IImageProxy{
    fetchImages(props: FetchImagesProps): Promise<ImageModel[]>;
    createImage(imgToSave: ImageModel, image: Blob, thumbnail: Blob):Promise<ImageModel>;
    updateImage(imageToSave: ImageModel):Promise<ImageModel>;
    deleteImage(image: ImageModel): Promise<ImageModel>;

    onEntityDeleted(parentUiId: string):Promise<void>;
}

class ImageProxy implements IImageProxy, IUserStorageListener {
    private baseUrl:string = `${process.env.REACT_APP_API_URL_BASE}images/`;

    private inMemory: { [url: string]: ImageModel[]} = {};

    public constructor() {
      storageService.registerUserStorageListener(this);
    }

    public onUserStorageOpened = async (): Promise<void> => {
      this.inMemory = {};

      const keys = await storageService.getUserStorage().keys();
      const imageKeys = _.filter(keys, (key) => _.startsWith(key, this.baseUrl));

      const updateInMemory = async (imagesKey: string): Promise<void> => {
        this.inMemory[imagesKey] = await progressiveHttpProxy.getArrayFromStorage({ url: imagesKey });
      };

      await Promise.all(imageKeys.map((imageKey) => updateInMemory(imageKey)));
    }

    public onUserStorageClosed = async (): Promise<void> => {
      this.inMemory = {};
    }

    // //////////////Equipment////////////////////////
    fetchImages = async ({
      parentUiId, forceToLookUpInStorage = false, checkStorageFirst = false, cancelToken = undefined, cancelTimeout = false,
    }: FetchImagesProps): Promise<ImageModel[]> => {
      if (forceToLookUpInStorage) {
        return _.get(this.inMemory, this.baseUrl + parentUiId, []);
      }

      if (checkStorageFirst) {
        const images = _.get(this.inMemory, this.baseUrl + parentUiId, undefined);
        if (images !== undefined) {
          return images;
        }
      }

      const images = await progressiveHttpProxy.getArrayOnlineFirst<ImageModel>({
        url: this.baseUrl + parentUiId, keyName: 'images', cancelToken, cancelTimeout,
      });
      this.inMemory[this.baseUrl + parentUiId] = images;

      return images;
    }

    createImage = async (imgToSave: ImageModel, blobImage: Blob, thumbnail: Blob):Promise<ImageModel> => {
      await storageService.setItem(imgToSave.url, await blobToDataURL(blobImage));
      await storageService.setItem(imgToSave.thumbnailUrl, await blobToDataURL(thumbnail));

      const createImageUrl = this.baseUrl + imgToSave.parentUiId;

      const savedImage: ImageModel = await progressiveHttpProxy.postNewImage(createImageUrl, extractImageModel(imgToSave), blobImage, thumbnail);

      const updateImages = await storageService.updateArray(createImageUrl, savedImage);
      this.inMemory[createImageUrl] = updateImages;

      userContext.onImageAdded(savedImage.sizeInByte);
      analytics.addContent('image');
      return savedImage;
    }

    updateImage = async (imageToSave: ImageModel):Promise<ImageModel> => {
      const updatedImage = await progressiveHttpProxy.postAndUpdate(`${this.baseUrl + imageToSave.parentUiId}/${imageToSave._uiId}`, 'image', extractImageModel(imageToSave), (image) => image);

      const updatedImages = await storageService.updateArray(this.baseUrl + updatedImage.parentUiId, updatedImage);
      this.inMemory[this.baseUrl + updatedImage.parentUiId] = updatedImages;
      analytics.saveContent('image');

      return updatedImage;
    };

    deleteImage = async (image: ImageModel): Promise<ImageModel> => {
      await progressiveHttpProxy.delete<ImageModel>(`${this.baseUrl + image.parentUiId}/${image._uiId}`);
      const deletedImage = await this.removeImageFromStorage(image);
      userContext.onImageRemoved(deletedImage.sizeInByte);
      analytics.deleteContent('image');

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
      this.inMemory[this.baseUrl + image.parentUiId] = await storageService.getArray(this.baseUrl + image.parentUiId);

      await storageService.removeItem<ImageModel>(image.url);
      await storageService.removeItem<ImageModel>(image.thumbnailUrl);

      return deletedImage;
    }
}

const imageProxy:IImageProxy = new ImageProxy();
export default imageProxy;
