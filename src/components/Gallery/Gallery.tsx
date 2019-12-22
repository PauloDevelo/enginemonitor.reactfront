import React, {
  useState, useEffect, useCallback,
} from 'react';
import { Button } from 'reactstrap';

import '../React-image-lightbox/style.css';

import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Lightbox from '../React-image-lightbox/index';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../../types/Types';
import GalleryComponent from './GalleryComponent';

import ModalEditImage from '../ModalImage/ModalEditImage';

import errorService from '../../services/ErrorService';
import imageProxy from '../../services/ImageProxy';

import useFetcher from '../../hooks/Fetcher';
import storageService from '../../services/StorageService';
import './Gallery.css';

type Props = {
    parentUiId: string
}

function Gallery({ parentUiId }: Props) {
  const [editImage, setEditImage] = useState<ImageModel | undefined>(undefined);
  const [images, setImages] = useState<ImageModel[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);

  const { data: fetchedImages, error: errorFetchingImages, isLoading } = useFetcher({ fetchPromise: imageProxy.fetchImages, fetchProps: { parentUiId }, cancellationMsg: 'Cancellation of images fetching' });

  useEffect(() => {
    setImages(fetchedImages || []);
  }, [fetchedImages]);

  useEffect(() => {
    if (errorFetchingImages !== undefined) {
      errorService.addError(errorFetchingImages);
    }
  }, [errorFetchingImages]);

  const addImage = useCallback((newImage:ImageModel) => {
    setImages((previousImages) => previousImages.concat(newImage));

    setEditImage(newImage);
  }, []);

  const onClickThumbnail = useCallback((newIndex: number) => {
    setIndex(newIndex);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      setOpen(false);
    }
  }, [images]);

  const deleteImage = useCallback((deletedImageUiId: string) => {
    setImages((previousImages) => {
      const newImages = previousImages.filter((image) => image._uiId !== deletedImageUiId);
      if (newImages.length !== 0) {
        setIndex(0);
      }

      return newImages;
    });
  }, []);

  const onEditImageDeleted = useCallback(() => {
    if (editImage !== undefined) {
      deleteImage(editImage._uiId);
    }
  }, [editImage, deleteImage]);

  const onEditImageUpdated = useCallback((updatedImage: ImageModel) => {
    if (editImage !== undefined) {
      setImages((previousImages) => {
        const editImageIndex = previousImages.indexOf(editImage);

        if (editImageIndex !== -1) {
          const newImages = [...previousImages];
          newImages[editImageIndex] = updatedImage;

          return newImages;
        }

        return previousImages;
      });
    }
  }, [editImage]);

  const closeModalEditImage = () => {
    setEditImage(undefined);
  };

  const deleteCurrentImage = useCallback(() => {
    imageProxy.deleteImage(images[index]).then((deletedImage) => {
      deleteImage(deletedImage._uiId);
    }).catch((reason) => {
      errorService.addError(reason);
    });
  }, [images, index, deleteImage]);

  const editCurrentImage = useCallback(() => {
    setEditImage(images[index]);
  }, [index, images]);

  const additionalActions = [
    <Button onClick={deleteCurrentImage} className="action-button"><FontAwesomeIcon icon={faTrashAlt} size="lg" /></Button>,
    <Button onClick={editCurrentImage} className="action-button"><FontAwesomeIcon icon={faEdit} size="lg" /></Button>,
  ];

  const galleryStyles = { overlay: { zIndex: 1050 } };

  return (
    <>
      <GalleryComponent
        parentUiId={parentUiId}
        images={images}
        isLoading={isLoading}
        onClickThumbnail={onClickThumbnail}
        addImage={addImage}
      />
      {isOpen && images[index] !== undefined && (
        <Lightbox
          imageCrossOrigin="anonymous"
          storage={storageService.getUserStorage()}
          mainSrc={images[index].url}
          nextSrc={images[(index + 1) % images.length].url}
          prevSrc={images[(index + images.length - 1) % images.length].url}
          mainSrcThumbnail={images[index].thumbnailUrl}
          nextSrcThumbnail={images[(index + 1) % images.length].thumbnailUrl}
          prevSrcThumbnail={images[(index + images.length - 1) % images.length].thumbnailUrl}
          onCloseRequest={() => setOpen(false)}
          onMovePrevRequest={() => setIndex((index + images.length - 1) % images.length)}
          onMoveNextRequest={() => setIndex((index + 1) % images.length)}
          toolbarButtons={additionalActions}
          imageCaption={images[index].description}
          imageTitle={images[index].title}
          reactModalStyle={galleryStyles}
        />
      )}
      <ModalEditImage
        visible={editImage !== undefined}
        image={editImage}
        onImageDeleted={onEditImageDeleted}
        onImageSaved={onEditImageUpdated}
        toggle={closeModalEditImage}
      />
    </>
  );
}

export default React.memo(Gallery);
