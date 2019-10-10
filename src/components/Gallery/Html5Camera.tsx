import React from 'react';

import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import "./Html5Camera.css"

import {resizeAndSaveBase64Image} from '../../helpers/ImageHelper';

import { ImageModel } from '../../types/Types';

import errorService from '../../services/ErrorService';

type Props = {
    imageParentUiId: string,
    addImage: (image: ImageModel) => void;
    close: ()=> void;
}

const Html5Camera = ({imageParentUiId, addImage, close}: Props) => {

    const onCameraError = (error: any) => {
        close();
    }
 
    const onCameraStart = (stream: MediaStream) => {
    }
 
    const onCameraStop = () => {
        close();
    }

    const onTakePhoto = async (dataUri: string, method: string) => {
        try{
            if(method === "multer"){
                const newImage = await resizeAndSaveBase64Image(dataUri, imageParentUiId);
                addImage(newImage);
            }
        }
        catch(error){
            errorService.addError(error);
        }
    }
 
    return (
        <div id={"cameraContainer"} onClick={close}>
            <Camera
                onTakePhoto = { (dataUri: string) => {
                    onTakePhoto(dataUri, "multer");
                    close();
                }}
                onCameraError = { (error: any) => onCameraError(error) }
                idealFacingMode = {FACING_MODES.ENVIRONMENT}
                idealResolution = {{width: 1024, height: 1024}}
                imageType = {IMAGE_TYPES.JPG}
                imageCompression = {0.92}
                isMaxResolution = {false}
                isImageMirror = {false}
                isSilentMode = {false}
                isDisplayStartCameraError = {true}
                isFullscreen = {false}
                sizeFactor = {1}
                onCameraStart = { (stream: MediaStream) => onCameraStart(stream) }
                onCameraStop = { () => onCameraStop() }
            />
        </div>
    );
}

export default React.memo(Html5Camera);