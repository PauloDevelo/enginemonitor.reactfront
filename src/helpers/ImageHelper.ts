import uuidv1 from 'uuid/v1';

import Resizer from 'react-image-file-resizer';
import { create } from 'exif-parser';
import imageProxy from '../services/ImageProxy';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../types/Types';

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
    console.error('Impossible to get the image orientation in the Exif data.');
    console.error(error);
    return 0;
  }
};

// eslint-disable-next-line max-len
const resizeImageIntoBlob = (imageFile: File, maxWidth: number, maxHeight: number, orientationInDegrees: number):Promise<string> => new Promise((resolve) => {
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

// eslint-disable-next-line max-len
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
    console.error(event);
    reject(new Error(event.toString()));
  });

  img.src = base64Str;
});

// eslint-disable-next-line max-len
export const resizeAndSaveBase64Image = async (imageBase64: string, parentUiId: string):Promise<ImageModel> => {
  const resizedBlob = await resizeBase64ImageIntoBlob(imageBase64, 1024, 1024);
  const thumbnailBlob = await resizeBase64ImageIntoBlob(imageBase64, 100, 100);

  const imgFormObj = new FormData();
  imgFormObj.append('name', `${parentUiId}.jpeg`);
  imgFormObj.append('imageData', resizedBlob, `${parentUiId}.jpeg`);
  imgFormObj.append('thumbnail', thumbnailBlob, `thumbnail_${parentUiId}.jpeg`);
  imgFormObj.append('parentUiId', parentUiId);
  imgFormObj.append('_uiId', uuidv1());

  return imageProxy.createImage(imgFormObj);
};

export const resizeAndSaveImage = async (file: File, parentUiId: string):Promise<ImageModel> => {
  const orientationInDegrees = await getOrientationInDegrees(file);
  const resizedBlob = await resizeImageIntoBlob(file, 1024, 1024, orientationInDegrees);
  const thumbnailBlob = await resizeImageIntoBlob(file, 100, 100, orientationInDegrees);

  const imgFormObj = new FormData();
  imgFormObj.append('name', file.name);
  imgFormObj.append('imageData', resizedBlob, `${file.name}.jpeg`);
  imgFormObj.append('thumbnail', thumbnailBlob, `thumbnail_${file.name}.jpeg`);
  imgFormObj.append('parentUiId', parentUiId);
  imgFormObj.append('_uiId', uuidv1());

  return imageProxy.createImage(imgFormObj);
};

export default resizeAndSaveImage;
