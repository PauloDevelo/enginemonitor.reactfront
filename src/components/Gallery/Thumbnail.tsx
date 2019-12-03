import React from 'react';
import Img from 'react-image';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../../types/Types';
import './Thumbnail.css';

type Props = {
    image: ImageModel;
    onClickImage: undefined | (() => void);
}
function Thumbnail({ image, onClickImage }: Props) {
  const displayImage = () => {
    if (onClickImage !== undefined) {
      onClickImage();
    }
  };

  const alt = `${image.title} - ${image.description}`;

  return <Img src={image.thumbnailUrl} alt={alt} onClick={displayImage} className="thumbnail grow" />;
}

export default React.memo(Thumbnail);
