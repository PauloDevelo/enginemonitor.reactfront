import uuidv1 from 'uuid/v1';

import imageProxy from '../services/ImageProxy';
import Resizer from 'react-image-file-resizer';
import { ImageModel } from '../types/Types';

import {create} from "exif-parser";

const compressionQuality = 95;

const resizeImageIntoBlob = (imageFile: File, maxWidth: number, maxHeight: number, orientationInDegrees: number):Promise<string> => {
    return new Promise(function(resolve, reject) {
        Resizer.imageFileResizer(
            imageFile,
            maxWidth,
            maxHeight,
            'JPEG', // is the compressFormat of the  new image
            compressionQuality,
            orientationInDegrees, // is the rotation of the  new image
            (blob: any) => { resolve(blob); },  // is the callBack function of the new image URI
            'blob'  // is the output type of the new image
        );
    });
}

const resizeBase64ImageIntoBlob = (base64Str: string, maxWidth = 400, maxHeight = 350):Promise<Blob> => {
    return new Promise((resolve) => {
        let img = new Image()
        img.src = base64Str
        img.onload = () => {
            let canvas = document.createElement('canvas')
            const MAX_WIDTH = maxWidth
            const MAX_HEIGHT = maxHeight
            let width = img.width
            let height = img.height
    
            if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
            }
            } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
            }
            }
            canvas.width = width
            canvas.height = height
            let ctx = canvas.getContext('2d');
            if(ctx !== null){
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob(blob => {
                    if (blob !== null){
                        resolve(blob);
                    }
                    else{
                        throw new Error("The blob cannot be created");
                    }
                });
            }
            else{
                throw new Error("Cannot get the canva's context");
            }
        }
    });
  }

  export const resizeAndSaveBase64Image = async (imageBase64: string, parentUiId: string):Promise<ImageModel> => {
    const resizedBlob = await resizeBase64ImageIntoBlob(imageBase64, 1024, 1024);
    const thumbnailBlob = await resizeBase64ImageIntoBlob(imageBase64, 100, 100);

    const imgFormObj = new FormData();
        imgFormObj.append("name", parentUiId + ".jpeg");
        imgFormObj.append("imageData", resizedBlob, parentUiId + ".jpeg");
        imgFormObj.append("thumbnail", thumbnailBlob, "thumbnail_" + parentUiId + ".jpeg");
        imgFormObj.append("parentUiId", parentUiId);
        imgFormObj.append("_uiId", uuidv1());

    return await imageProxy.createImage(imgFormObj);
}

export const resizeAndSaveImage = async (file: File, parentUiId: string):Promise<ImageModel> => {
    const tags = await readExifTags(file);
    const orientationInDegrees = convertExifOrientationIntoDegree(tags["Orientation"]);
    
    const resizedBlob = await resizeImageIntoBlob(file, 1024, 1024, orientationInDegrees);
    const thumbnailBlob = await resizeImageIntoBlob(file, 100, 100, orientationInDegrees);

    const imgFormObj = new FormData();
        imgFormObj.append("name", file.name);
        imgFormObj.append("imageData", resizedBlob, file.name + ".jpeg");
        imgFormObj.append("thumbnail", thumbnailBlob, "thumbnail_" + file.name + ".jpeg");
        imgFormObj.append("parentUiId", parentUiId);
        imgFormObj.append("_uiId", uuidv1());

    return await imageProxy.createImage(imgFormObj);
}

const readExifTags= async (file: File):Promise<any> => {
    return new Promise(function(resolve, reject) {
        const fileReader = new FileReader();
        fileReader.onloadend = (ev:ProgressEvent) => {
            var parser = create(fileReader.result as unknown as Buffer);
            try {
                var result = parser.parse();
                resolve(result.tags);
            } catch(err) {
                reject(err);
            }
        };
        fileReader.readAsArrayBuffer(file);
    });
}

const convertExifOrientationIntoDegree = (exifOrientation: number): number => {
    switch(exifOrientation){
        case 1:
            return 0;
        case 2:
            return 0;
        case 3:
            return 180;
        case 4:
            return 180;
        case 5:
            return 90;
        case 6:
            return 90;
        case 7:
            return 270;
        case 8:
            return 270;
        default:
            return 0;
    }
}

export default resizeAndSaveImage;