import React, { useState, useEffect, useCallback,Fragment } from 'react';
import { Label, Button } from 'reactstrap';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import Html5Camera from "./Html5Camera";

import Image from './Image';

import { ImageModel } from '../../types/Types';
import FileChooserButton from './FileChooserButton';

import imageProxy from '../../services/ImageProxy';
import {resizeAndSaveImage, resizeAndSaveBase64Image} from '../../helpers/ImageHelper';

import { faCamera,faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    parentUiId: string
}

function Gallery({parentUiId}: Props){
    const [images, setImages] = useState<ImageModel[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [isCameraOn, setCamera] = useState(false);
    const [index, setIndex] = useState(-1);

    useEffect(() => {
        imageProxy.fetchImages(parentUiId)
        .then(images => {
            setImages(images);
        })
        .catch((error) => {
            console.error("Error when fetching the image for " + parentUiId);
            console.error(error);
        });
    }, [parentUiId]);

    const onCapture = (imageBase64: string) => {
        uploadBase64Image(imageBase64, "multer");
    };

    const uploadBase64Image = async(imageBase64: string, method: string) => {
        if(method === "multer"){
            const newImage = await resizeAndSaveBase64Image(imageBase64, parentUiId);
            const newImages = images.concat(newImage);

            setImages(newImages);
        }
    };

    const onSelectFile = async(file: File) => {
        uploadImageFile(file, "multer")
    };

    const uploadImageFile = async(file: File, method: string) => {
        if(method === "multer"){
            const newImage = await resizeAndSaveImage(file, parentUiId);
            const newImages = images.concat(newImage);

            setImages(newImages);
        }
    };

    const onClickThumbnail = (image:ImageModel, index: number) => {
        setIndex(index);
        setOpen(true);
    }

    const thumbnails = images.map((image, index) => {
        return <Image key={image._uiId} image={image} index={index} onClickImage={onClickThumbnail} />;
    });

    const deleteCurrentImage = useCallback(() => {
        console.log("delete image");
        imageProxy.deleteImage(images[index]).then(deletedImage => {
            const newImages = images.filter(image => image._uiId !== deletedImage._uiId);
            if(newImages.length === 0){
                setOpen(false);
            }
            else{
                setIndex(0);
            }
            setImages(newImages);
        });
    }, [images, index]);

    const additionalActions  =  [
        <Button onClick={deleteCurrentImage} ><FontAwesomeIcon icon={faTrashAlt} size="lg"/></Button>,
    ];

	return(
        <Fragment>
            <div>
                <Label className="font-weight-bold">Gallery image</Label>
                <div className="p-1 border border-secondary rounded shadow">
                    <FileChooserButton onFileSelect={onSelectFile} className="float-right"/>
                    <Button onClick={() => setCamera(true)} className="float-right"><FontAwesomeIcon icon={faCamera} size="lg"/></Button>
                    {thumbnails}
                </div>
            </div>
            {isOpen && (
                <Lightbox
                mainSrc={images[index].url}
                nextSrc={images[(index + 1) % images.length].url}
                prevSrc={images[(index + images.length - 1) % images.length].url}
                mainSrcThumbnail= {images[index].thumbnailUrl}
                nextSrcThumbnail= {images[(index + 1) % images.length].thumbnailUrl}
                prevSrcThumbnail= {images[(index + images.length - 1) % images.length].thumbnailUrl}
                onCloseRequest={() => setOpen(false)}
                onMovePrevRequest={() => setIndex((index + images.length - 1) % images.length)}
                onMoveNextRequest={() => setIndex((index + 1) % images.length) }
                toolbarButtons={additionalActions}
                />
            )}

            {isCameraOn && <Html5Camera close={() => setCamera(false)} onTakePhoto={onCapture}/>}
        </Fragment>
	);
}

export default React.memo(Gallery);