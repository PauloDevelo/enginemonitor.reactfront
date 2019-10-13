import React from 'react';
import {Button} from 'reactstrap';

import { faImage, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ImageModel } from '../../types/Types';

import {resizeAndSaveImage} from '../../helpers/ImageHelper';

import errorService from '../../services/ErrorService';

type Props = {
    parentUiId: string,
    className?: string,
    addImage: (image: ImageModel) => void
}

const createFileSelector = (onChange: (e: Event)=>void):HTMLInputElement => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.addEventListener('change', onChange);

    return fileSelector;
}

function AddImageFileButton({parentUiId, addImage, className}: Props){
    const onFileSelected = (file: File) => {
        uploadImageFile(file, "multer");
    };

    const uploadImageFile = async(file: File, method: string) => {
        try{
            let newImage:ImageModel | undefined = undefined;

            if(method === "multer"){
                newImage = await resizeAndSaveImage(file, parentUiId);
                addImage(newImage);
            }
        }
        catch(error){
            errorService.addError(error);
        }
    };

    const onChange = (e: Event) => {
        const changeEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
        const files = changeEvent.target.files ? changeEvent.target.files : new FileList() ;
        
        if(files.length > 0){
            onFileSelected(files[0]);
        }
    }

    const fileSelector = createFileSelector(onChange);

    const handleFileSelect = (e: React.MouseEvent):void => {
        e.preventDefault();
        fileSelector.click();
    }

    return (
    <Button color="light" size="lg" className={className} onClick={handleFileSelect} aria-label="Edit">
        <span className="fa-layers fa-fw">
            <FontAwesomeIcon icon={faImage} size="lg"/>
            <FontAwesomeIcon icon={faPlus} size="xs" transform="down-13 left-16"/>
        </span>
    </Button>);
}

export default React.memo(AddImageFileButton);