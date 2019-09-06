import uuidv1 from 'uuid/v1';

import imageProxy from '../services/ImageProxy';
import Resizer from 'react-image-file-resizer';

const compressionQuality = 95;

const resizeImageIntoURI = (imageFile: File, maxWidth: number, maxHeight: number):Promise<string> => {
    return new Promise(function(resolve, reject) {
        Resizer.imageFileResizer(
            imageFile,
            maxWidth,
            maxHeight,
            'JPEG', // is the compressFormat of the  new image
            compressionQuality,
            0, // is the rotation of the  new image
            (uri: any) => { resolve(uri); },  // is the callBack function of the new image URI
            'base64'  // is the output type of the new image
        );
    });
}

const resizeImageIntoBlob = (imageFile: File, maxWidth: number, maxHeight: number):Promise<string> => {
    return new Promise(function(resolve, reject) {
        Resizer.imageFileResizer(
            imageFile,
            maxWidth,
            maxHeight,
            'JPEG', // is the compressFormat of the  new image
            compressionQuality,
            0, // is the rotation of the  new image
            (blob: any) => { resolve(blob); },  // is the callBack function of the new image URI
            'blob'  // is the output type of the new image
        );
    });
}


export const resizeAndSaveImage = async (file: File, parentUiId: string):Promise<void> => {
    const resizedBlob = await resizeImageIntoBlob(file, 100, 100);

    const imgFormObj = new FormData();
        imgFormObj.append("name", file.name);
        imgFormObj.append("imageData", resizedBlob, file.name + ".jpeg");
        imgFormObj.append("parentUiId", parentUiId);
        imgFormObj.append("_uiId", uuidv1());

    await imageProxy.createImage(imgFormObj);
}

const dataURItoBlob = (dataURI: string):Blob => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

export default resizeAndSaveImage;