import React, { ChangeEvent, useState, useEffect, Fragment } from 'react';
import { Label } from 'reactstrap';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import Image from './Image';

import { ImageModel } from '../../types/Types';
import FileChooserButton from './FileChooserButton';

import imageProxy from '../../services/ImageProxy';
import resizeAndSaveImage from '../../helpers/ImageHelper';

type Props = {
    parentUiId: string
}

function Gallery({parentUiId}: Props){
    const [images, setImages] = useState<ImageModel[]>([]);
    const [isOpen, setOpen] = useState(false);
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

    const uploadImage = async(e: ChangeEvent<HTMLInputElement>, method: string) => {
        if(method === "multer" && e.target.files !== null && e.target.files.length > 0){
            const newImage = await resizeAndSaveImage(e.target.files[0], parentUiId);
            const newImages = images.concat(newImage);

            setImages(newImages);
        }
    };

    const onSelectFile = async(file: File) => {
        uploadImageFile(file, "multer")
    }

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

	return(
        <Fragment>
            <div>
                <Label className="font-weight-bold">Gallery image</Label>
                <div className="p-1 border border-secondary rounded shadow">
                    <FileChooserButton onFileSelect={onSelectFile}/>
                    {thumbnails}
                </div>
            </div>
            {isOpen && (
                <Lightbox
                mainSrc={images[index].url}
                nextSrc={images[(index + 1) % images.length].url}
                prevSrc={images[(index + images.length - 1) % images.length].url}
                onCloseRequest={() => setOpen(false)}
                onMovePrevRequest={() => setIndex((index + images.length - 1) % images.length)}
                onMoveNextRequest={() => setIndex((index + 1) % images.length) }
                />
            )}
        </Fragment>
	);
}

export default React.memo(Gallery);