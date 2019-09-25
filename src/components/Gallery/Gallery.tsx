import React, { useState, useEffect, useCallback,Fragment } from 'react';
import { Label, Button } from 'reactstrap';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import Html5Camera from "./Html5Camera";

import Image from './Image';

import { ImageModel } from '../../types/Types';
import FileChooserButton from './FileChooserButton';

import ModalEditImage from '../ModalImage/ModalEditImage';

import errorService from '../../services/ErrorService';
import imageProxy from '../../services/ImageProxy';
import {resizeAndSaveImage, resizeAndSaveBase64Image} from '../../helpers/ImageHelper';

import { faCamera, faTrashAlt, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import "./Gallery.css";

type Props = {
    parentUiId: string
}

function Gallery({parentUiId}: Props){
    const [editImage, setEditImage] = useState<ImageModel | undefined>(undefined);
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
            errorService.addError(error);
        });
    }, [parentUiId]);

    const turnOnCamera = () => {
        setCamera(true);
    }

    const onCapture = (imageBase64: string) => {
        uploadBase64Image(imageBase64, "multer");
    };

    const uploadBase64Image = async(imageBase64: string, method: string) => {
        try{
            let newImage:ImageModel | undefined = undefined;

            if(method === "multer"){
                newImage = await resizeAndSaveBase64Image(imageBase64, parentUiId);
                addImage(newImage);
            }
    
            if (newImage !== undefined){
                showModalEditImage(newImage);
            }
        }
        catch(error){
            errorService.addError(error);
        }
    };

    const onSelectFile = async(file: File) => {
        uploadImageFile(file, "multer")
    };

    const uploadImageFile = async(file: File, method: string) => {
        try{
            let newImage:ImageModel | undefined = undefined;

            if(method === "multer"){
                newImage = await resizeAndSaveImage(file, parentUiId);
                addImage(newImage);
            }

            if (newImage !== undefined){
                showModalEditImage(newImage);
            }
        }
        catch(error){
            errorService.addError(error);
        }
    };

    const addImage = (newImage:ImageModel) => {
        const newImages = images.concat(newImage);
        setImages(newImages);
    }

    const showModalEditImage = (image: ImageModel) => {
        setEditImage(image);
    }

    const onClickThumbnail = (image:ImageModel, index: number) => {
        setIndex(index);
        setOpen(true);
    }

    const onEditImageDeleted = useCallback(() => {
        if(editImage !== undefined){
            deleteImage(editImage._uiId);
        }
    }, [editImage]);

    const onEditImageUpdated = (updatedImage: ImageModel) => {
        if(editImage !== undefined){
            var editImageIndex = images.indexOf(editImage);
            
            if (editImageIndex !== -1) {
                const newImages = [...images];
                newImages[editImageIndex] = updatedImage;

                setImages(newImages);
            }
        }
    }

    const closeModalEditImage = () => {
        setEditImage(undefined);
    }

    const deleteCurrentImage = useCallback(() => {
        imageProxy.deleteImage(images[index]).then(deletedImage => {
            deleteImage(deletedImage._uiId);
        }).catch(reason => {
            errorService.addError(reason);
        });
    }, [images, isOpen, index]);

    const editCurrentImage = useCallback(() => {
        showModalEditImage(images[index]);
    }, [index, images]);

    const deleteImage = (deletedImageUiId: string) => {
        const newImages = images.filter(image => image._uiId !== deletedImageUiId);
            if(newImages.length === 0){
                setOpen(false);
            }
            else{
                setIndex(0);
            }
            setImages(newImages);
    }

    const thumbnails = images.map((image, index) => {
        return <Image key={image._uiId} image={image} index={index} onClickImage={onClickThumbnail} />;
    });

    const additionalActions  =  [
        <Button onClick={deleteCurrentImage} className={"action-button"}><FontAwesomeIcon icon={faTrashAlt} size="lg"/></Button>,
        <Button onClick={editCurrentImage} className={"action-button"}><FontAwesomeIcon icon={faEdit} size="lg"/></Button>,
    ];

    
    const galleryStyles = {overlay: {zIndex: 1100}};

	return(
        <Fragment>
            <div>
                <Label className="font-weight-bold">Gallery image</Label>
                <div className="p-1 border border-secondary rounded shadow gallery">
                    <FileChooserButton onFileSelect={onSelectFile} className="float-right"/>
                    <Button color="light" size="lg" onClick={turnOnCamera} className="float-right">
                        <span className="fa-layers fa-fw">
                            <FontAwesomeIcon icon={faCamera} size="lg"/>
                            <FontAwesomeIcon icon={faPlus} size="xs" transform="down-13 left-16"/>
                        </span>
                    </Button>
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
                onMoveNextRequest={() => setIndex((index + 1) % images.length)}
                toolbarButtons={additionalActions}
                imageCaption={images[index].description}
                imageTitle={images[index].title}
                reactModalStyle={galleryStyles}
                />
            )}

            {isCameraOn && <Html5Camera close={() => setCamera(false)} onTakePhoto={onCapture}/>}

            <ModalEditImage visible={editImage !== undefined} image={editImage} onImageDeleted={onEditImageDeleted} onImageSaved={onEditImageUpdated} toggle={closeModalEditImage}/>
        </Fragment>
	);
}

export default React.memo(Gallery);