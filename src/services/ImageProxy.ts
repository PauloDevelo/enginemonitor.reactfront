import progressiveHttpProxy from './ProgressiveHttpProxy';
import httpProxy from './HttpProxy';

import storageService from './StorageService';

import { ImageModel, EntityModel } from '../types/Types'

export interface IImageProxy{
    fetchImages(parentUiId: string): Promise<ImageModel[]>;
    createImage(imgFormObj: FormData):Promise<ImageModel>;
    updateImage(imageToSave: ImageModel):Promise<ImageModel>;
    deleteImage(image: ImageModel): Promise<ImageModel>;
}

class ImageProxy implements IImageProxy{
    private baseUrl:string = process.env.REACT_APP_URL_BASE + "images/";

    ////////////////Equipment////////////////////////
    fetchImages = async(parentUiId: string, forceToLookUpInStorage: boolean = false): Promise<ImageModel[]> => {
        if (forceToLookUpInStorage){
            return await storageService.getArray<ImageModel>(this.baseUrl + parentUiId);
        }
        
        return await progressiveHttpProxy.getArrayOnlineFirst<ImageModel>(this.baseUrl + parentUiId, "images", (image) => image);
    }
    
    createImage = async(imgFormObj: FormData):Promise<ImageModel> => {
        const {image} = await httpProxy.post(this.baseUrl + imgFormObj.get('parentUiId'), imgFormObj);
        return image;
    }

    updateImage = async(imageToSave: ImageModel):Promise<ImageModel> => {
        const {image} = await httpProxy.post(this.baseUrl + imageToSave.parentUiId + "/" + imageToSave._uiId, imageToSave);
        return image;
    };

    deleteImage = async (image: ImageModel): Promise<ImageModel> => {
        await progressiveHttpProxy.deleteAndUpdate<ImageModel>(this.baseUrl + image.parentUiId, "image", (image) => image);
        return await storageService.removeItemInArray<ImageModel>(this.baseUrl + image.parentUiId, image._uiId);
    }
}

const imageProxy:IImageProxy = new ImageProxy();
export default imageProxy;