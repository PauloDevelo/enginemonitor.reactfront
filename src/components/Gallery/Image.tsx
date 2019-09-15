import React from 'react';
import { Media } from 'reactstrap';

import { ImageModel } from '../../types/Types';
import './Image.css';

type Props = {
    image: ImageModel;
    index: number;
    onClickImage: undefined | ((image: ImageModel, index: number) => void);
}
function Image({image, index, onClickImage}: Props){
    const displayImage = () => {
        if (onClickImage !== undefined){
            onClickImage(image, index);
        }
    }

    const alt  = image.title + " - " + image.description;

    return <Media object src={ image.thumbnailUrl } alt={alt} onClick={displayImage} className={"thumbnail grow"}/>
}

export default React.memo(Image);