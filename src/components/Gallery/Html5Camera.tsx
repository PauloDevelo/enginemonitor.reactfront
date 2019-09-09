import React from 'react';
import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import "./Html5Camera.css"

type Props = {
    onTakePhoto: (dataUri: string) => void;
    close: ()=> void;
}

const Html5Camera = ({onTakePhoto, close}: Props) => {

    const onCameraError = (error: any) => {
        console.error('onCameraError', error);
    }
 
    const onCameraStart = (stream: MediaStream) => {
        console.log('onCameraStart');
    }
 
    const onCameraStop = () => {
        console.log('onCameraStop');
        close();
    }
 
    return (
        <div id={"cameraContainer"} onClick={close}>
            <Camera
                onTakePhoto = { (dataUri: string) => {
                    onTakePhoto(dataUri);
                    close();
                }}
                onCameraError = { (error: any) => onCameraError(error) }
                idealFacingMode = {FACING_MODES.ENVIRONMENT}
                idealResolution = {{width: 1024, height: 1024}}
                imageType = {IMAGE_TYPES.JPG}
                imageCompression = {0.97}
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