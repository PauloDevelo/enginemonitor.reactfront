import * as log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';

import Resizer from 'react-image-file-resizer';
import { create } from 'exif-parser';
import imageProxy from '../services/ImageProxy';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';
import userContext from '../services/UserContext';

const compressionQuality = 95;

const convertExifOrientationIntoDegree = (exifOrientation: number): number => {
  switch (exifOrientation) {
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
};

const readExifTags = async (file: File):Promise<any> => new Promise(((resolve, reject) => {
  const fileReader = new FileReader();
  fileReader.addEventListener('loadend', () => {
    const parser = create(fileReader.result as unknown as Buffer);
    try {
      const result = parser.parse();
      resolve(result.tags);
    } catch (err) {
      reject(err);
    }
  });
  fileReader.readAsArrayBuffer(file);
}));

const getOrientationInDegrees = async (file: File): Promise<number> => {
  try {
    const tags = await readExifTags(file);
    return convertExifOrientationIntoDegree(tags.Orientation);
  } catch (error) {
    log.warn('Impossible to get the image orientation in the Exif data.');
    log.warn(error.message);
    return 0;
  }
};

const resizeImageIntoBlob = (imageFile: File, maxWidth: number, maxHeight: number, orientationInDegrees: number):Promise<Blob> => new Promise((resolve) => {
  Resizer.imageFileResizer(
    imageFile,
    maxWidth,
    maxHeight,
    'JPEG', // is the compressFormat of the  new image
    compressionQuality,
    orientationInDegrees, // is the rotation of the  new image
    (blob: any) => { resolve(blob); }, // is the callBack function of the new image URI
    'blob', // is the output type of the new image
  );
});

const resizeBase64ImageIntoBlob = (base64Str: string, maxWidth = 400, maxHeight = 350):Promise<Blob> => new Promise((resolve, reject) => {
  const img = new Image();

  img.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = maxWidth;
    const MAX_HEIGHT = maxHeight;
    let { width } = img;
    let { height } = img;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
      height = MAX_HEIGHT;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx !== null) {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob !== null) {
          resolve(blob);
        } else {
          throw new Error('The blob cannot be created');
        }
      },
      'image/jpeg', compressionQuality / 100);
    } else {
      throw new Error("Cannot get the canva's context");
    }
  });

  img.addEventListener('error', (event: Event| string) => {
    log.error(event);
    reject(new Error(event.toString()));
  });

  img.src = base64Str;
});

export const convertUrlImageIntoDataUrl = (urlImage: string):Promise<string> => new Promise((resolve, reject) => {
  const img = new Image();

  img.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width as number;
    canvas.height = img.height as number;

    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error("Cannot get the canva's context");
    }

    ctx.drawImage(img, 0, 0, img.width as number, img.height as number);
    resolve(canvas.toDataURL('image/jpeg', 0.95));
  });

  img.addEventListener('error', (event: Event| string) => {
    log.error(event);
    reject(new Error(event.toString()));
  });

  img.crossOrigin = 'anonymous';
  img.src = urlImage;
});

export const createImageModel = (parentUiId: string):ImageModel => {
  const uiid = uuidv4();
  return ({
    _uiId: uiid,
    name: `${parentUiId}.jpeg`,
    parentUiId,
    title: '',
    description: '',
    sizeInByte: 0,
    thumbnailUrl: `${process.env.REACT_APP_API_URL_BASE}${userContext.getCurrentUser()!.imageFolder}/thumbnail_${uiid}.jpeg`,
    url: `${process.env.REACT_APP_API_URL_BASE}${userContext.getCurrentUser()!.imageFolder}/${uiid}.jpeg`,
  });
};

export const resizeAndSaveBase64Image = async (imageBase64: string, parentUiId: string):Promise<ImageModel> => {
  const resizedBlob = await resizeBase64ImageIntoBlob(imageBase64, 1024, 1024);
  const thumbnailBlob = await resizeBase64ImageIntoBlob(imageBase64, 100, 100);

  const imageToSave = createImageModel(parentUiId);

  return imageProxy.createImage(imageToSave, resizedBlob, thumbnailBlob);
};

export const resizeAndSaveImage = async (file: File, parentUiId: string):Promise<ImageModel> => {
  const orientationInDegrees = await getOrientationInDegrees(file);
  const resizedBlob = await resizeImageIntoBlob(file, 1024, 1024, orientationInDegrees);
  const thumbnailBlob = await resizeImageIntoBlob(file, 100, 100, orientationInDegrees);

  const imageToSave = createImageModel(parentUiId);

  return imageProxy.createImage(imageToSave, resizedBlob, thumbnailBlob);
};

export const base64ToBlob = (b64Data: string, contentType = '', sliceSize = 512):Blob => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const blobToDataURL = async (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(blob);
});

export function dataURItoBlob(dataURI: string): Blob {
  const base64Image = dataURI.split(',')[1];
  const contentType = dataURI.split(',')[0].split(':')[1].split(';')[0];
  return base64ToBlob(base64Image, contentType);
}

export default resizeAndSaveImage;
