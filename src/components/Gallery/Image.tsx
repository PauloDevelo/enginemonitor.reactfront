import React from 'react';
import { Media } from 'reactstrap';

import { ImageModel } from '../../types/Types';
import './Image.css';

type Props = {
    image: ImageModel;
    onClickImage: undefined | (() => void);
}
function Image({image, onClickImage}: Props){
    const displayImage = () => {
        if (onClickImage !== undefined){
            onClickImage();
        }
    }

    const alt  = image.title + " - " + image.description;

    return <Media object src={ image.thumbnailUrl } alt={alt} onClick={displayImage} className={"thumbnail grow"}/>
}

export default React.memo(Image);