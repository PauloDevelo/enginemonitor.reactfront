import React, { useState, useEffect, useCallback, useRef, Fragment, useMemo } from 'react';
import { Button } from 'reactstrap';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import Html5Camera from "./Html5Camera";

import { ImageModel } from '../../types/Types';
import GalleryComponent from './GalleryComponent';

import ModalEditImage from '../ModalImage/ModalEditImage';

import errorService from '../../services/ErrorService';
import imageProxy from '../../services/ImageProxy';

import { faTrashAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {useFetcher} from '../../hooks/Fetcher';

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

    const {data: fetchedImages, error: errorFetchingImages, isLoading} = useFetcher({ fetchPromise: imageProxy.fetchImages, fetchProps: { parentUiId }, cancellationMsg:"Cancellation of images fetching" });
	
	useEffect(() => {
        setImages(fetchedImages?fetchedImages:[]);
    }, [fetchedImages]);

    useEffect(() => {
        if(errorFetchingImages !== undefined){
            console.error("Error when fetching the image for " + parentUiId);
            errorService.addError(errorFetchingImages);
        }
    }, [errorFetchingImages]);

    const turnOnCamera = useCallback(() => {
        setCamera(true);
    }, []);

    const turnOffCamera = useCallback(() => {
        setCamera(false);
    }, []);

    const addImage = useCallback((newImage:ImageModel) => {
        setImages(previousImages => previousImages.concat(newImage));

        setEditImage(newImage);
    }, []);

    const onClickThumbnail = useCallback((index: number) => {
        setIndex(index);
        setOpen(true);
    }, []);

    useEffect(() => {
        if(images.length === 0){
            setOpen(false);
        }
    }, [images]);

    const deleteImage = useCallback((deletedImageUiId: string) => {
        setImages(previousImages => {
            const newImages = previousImages.filter(image => image._uiId !== deletedImageUiId);
            if(newImages.length !== 0){
                setIndex(0);
            }

            return newImages;
        });
    }, []);

    const onEditImageDeleted = useCallback(() => {
        if(editImage !== undefined){
            deleteImage(editImage._uiId);
        }
    }, [editImage, deleteImage]);

    const onEditImageUpdated = useCallback((updatedImage: ImageModel) => {
        if(editImage !== undefined){
            setImages(previousImages => {
                var editImageIndex = previousImages.indexOf(editImage);
            
                if (editImageIndex !== -1) {
                    const newImages = [...previousImages];
                    newImages[editImageIndex] = updatedImage;

                    return newImages;
                }

                return previousImages
            });
        }
    }, [editImage]);

    const closeModalEditImage = () => {
        setEditImage(undefined);
    }

    const deleteCurrentImage = useCallback(() => {
        imageProxy.deleteImage(images[index]).then(deletedImage => {
            deleteImage(deletedImage._uiId);
        }).catch(reason => {
            errorService.addError(reason);
        });
    }, [images, index, deleteImage]);

    const editCurrentImage = useCallback(() => {
        setEditImage(images[index]);
    }, [index, images]);

    const additionalActions  =  [
        <Button onClick={deleteCurrentImage} className={"action-button"}><FontAwesomeIcon icon={faTrashAlt} size="lg"/></Button>,
        <Button onClick={editCurrentImage} className={"action-button"}><FontAwesomeIcon icon={faEdit} size="lg"/></Button>,
    ];

    const galleryStyles = {overlay: {zIndex: 1050}};

	return(
        <Fragment>
            <GalleryComponent parentUiId={parentUiId} images={images} isLoading={isLoading} onClickThumbnail={onClickThumbnail} addImage={addImage} turnOnCamera={turnOnCamera} />
            {isOpen && images[index] !== undefined && (
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

            {isCameraOn && <Html5Camera imageParentUiId={parentUiId} close={turnOffCamera} addImage={addImage}/>}

            <ModalEditImage visible={editImage !== undefined} image={editImage} onImageDeleted={onEditImageDeleted} onImageSaved={onEditImageUpdated} toggle={closeModalEditImage}/>
        </Fragment>
	);
}

export default React.memo(Gallery);