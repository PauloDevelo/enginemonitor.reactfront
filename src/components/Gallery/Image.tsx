import React from 'react';
import { Media } from 'reactstrap';

import { ImageModel } from '../../types/Types';

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

    const alt  = "thumbnail " + image.name;

    return <Media object src={ image.thumbnailUrl } alt={alt} onClick={displayImage} />
}

export default React.memo(Image);