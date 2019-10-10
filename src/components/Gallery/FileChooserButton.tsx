import React from 'react';
import {Button} from 'reactstrap';

import { faImage, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    className?: string;
    onFileSelect: (file: File) => any;
}

const createFileSelector = (onChange: (e: Event)=>void):HTMLInputElement => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.addEventListener('change', onChange);

    return fileSelector;
}

function FileChooserButton({onFileSelect, className}: Props){
    const onChange = (e: Event) => {
        const changeEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
        const files = changeEvent.target.files ? changeEvent.target.files : new FileList() ;
        
        if(files.length > 0){
            onFileSelect(files[0]);
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

export default React.memo(FileChooserButton);