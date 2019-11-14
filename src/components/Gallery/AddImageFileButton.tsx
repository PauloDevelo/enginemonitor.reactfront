import React, { useCallback, useRef } from 'react';
import { Button } from 'reactstrap';

import { faImage, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../../types/Types';

import { resizeAndSaveImage } from '../../helpers/ImageHelper';

import errorService from '../../services/ErrorService';

type Props = {
    parentUiId: string,
    className?: string,
    addImage: (image: ImageModel) => void
}

const createFileSelector = (onChange: (e: Event)=>void):HTMLInputElement => {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('accept', 'image/png, image/jpeg');
  fileSelector.addEventListener('change', onChange);

  return fileSelector;
};

function AddImageFileButton({ parentUiId, addImage, className }: Props) {
  const uploadImageFile = useCallback(async (file: File, method: string) => {
    try {
      let newImage:ImageModel | undefined;

      if (method === 'multer') {
        newImage = await resizeAndSaveImage(file, parentUiId);
        addImage(newImage);
      }
    } catch (error) {
      errorService.addError(error);
    }
  }, [addImage, parentUiId]);

  const onChange = useCallback((e: Event) => {
    const changeEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
    const files = changeEvent.target.files ? changeEvent.target.files : new FileList();

    if (files.length > 0) {
      uploadImageFile(files[0], 'multer');
    }
  }, [uploadImageFile]);

  const fileSelector = useRef(createFileSelector(onChange));

  const handleFileSelect = useCallback((e: React.MouseEvent):void => {
    e.preventDefault();
    fileSelector.current.click();
  }, []);

  return (
    <Button color="light" className={className} onClick={handleFileSelect} aria-label="Edit">
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faImage} size="lg" />
        <FontAwesomeIcon icon={faPlus} size="xs" transform="down-13 left-16" />
      </span>
    </Button>
  );
}

export default React.memo(AddImageFileButton);
