// eslint-disable-next-line no-unused-vars
import { CancelToken } from 'axios';
import progressiveHttpProxy from './ProgressiveHttpProxy';
import httpProxy from './HttpProxy';

import storageService from './StorageService';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';

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
      const imgFormObj = new FormData();
      imgFormObj.append('name', imgToSave.name);
      imgFormObj.append('imageData', blobImage, `${imgToSave._uiId}.jpeg`);
      imgFormObj.append('thumbnail', thumbnail, `thumbnail_${imgToSave._uiId}.jpeg`);
      imgFormObj.append('parentUiId', imgToSave.parentUiId);
      imgFormObj.append('_uiId', imgToSave._uiId);

      const { image } = await httpProxy.post(this.baseUrl + imgFormObj.get('parentUiId'), imgFormObj);
      await storageService.updateArray(this.baseUrl + image.parentUiId, image);
      userContext.onImageAdded(image.sizeInByte);
      return image;
    }

    updateImage = async (imageToSave: ImageModel):Promise<ImageModel> => {
      const updatedImage = await progressiveHttpProxy.postAndUpdate(`${this.baseUrl + imageToSave.parentUiId}/${imageToSave._uiId}`, 'image', imageToSave, (image) => image);
      await storageService.updateArray(this.baseUrl + updatedImage.parentUiId, updatedImage);
      return updatedImage;
    };

    deleteImage = async (image: ImageModel): Promise<ImageModel> => {
      await progressiveHttpProxy.deleteAndUpdate<ImageModel>(`${this.baseUrl + image.parentUiId}/${image._uiId}`, 'image', (anImage) => anImage);
      const deletedImage = await storageService.removeItemInArray<ImageModel>(this.baseUrl + image.parentUiId, image._uiId);
      userContext.onImageRemoved(deletedImage.sizeInByte);

      return deletedImage;
    }

    onEntityDeleted = async (parentUiId: string):Promise<void> => {
      const images = await this.fetchImages({ parentUiId, forceToLookUpInStorage: true });

      await images.reduce(async (previousPromise, image) => {
        await previousPromise;
        const deletedImage = await storageService.removeItemInArray<ImageModel>(this.baseUrl + image.parentUiId, image._uiId);
        userContext.onImageRemoved(deletedImage.sizeInByte);
      }, Promise.resolve());
    }
}

const imageProxy:IImageProxy = new ImageProxy();
export default imageProxy;
