// eslint-disable-next-line no-use-before-define
import React from 'react';
import Img from '../ImageComponent/Img';
import storageService from '../../services/StorageService';

import Loading from '../Loading/Loading';

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

  return <Img storage={storageService.getUserStorage()} src={image.thumbnailUrl} alt={alt} onClick={displayImage} className="thumbnail grow" loader={<span className="spinnerContainer"><Loading onClick={displayImage} /></span>} />;
}

export default React.memo(Thumbnail);
