/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { Label } from 'reactstrap';
import { FormattedMessage, defineMessages } from 'react-intl';

import Loading from '../Loading/Loading';

import Thumbnail from './Thumbnail';

// eslint-disable-next-line no-unused-vars
import { ImageModel } from '../../types/Types';
import AddImageFileButton from './AddImageFileButton';

import './Gallery.css';

import jsonMessages from './Gallery.messages.json';

const galleryMsg = defineMessages(jsonMessages);

type Props = {
    parentUiId: string,
    images: ImageModel[],
    isLoading: boolean
    onClickThumbnail: (index: number) => void,
    addImage: (image: ImageModel) => void
};

function GalleryComponent({
  parentUiId, images, isLoading, onClickThumbnail, addImage,
}: Props) {
  const thumbnails = images.map((image, index) => <Thumbnail key={image._uiId} image={image} onClickImage={() => onClickThumbnail(index)} />);

  return (
    <>
      <div className="flex-row top-padding-4px">
        <Label className="font-weight-bold"><FormattedMessage {...galleryMsg.gallerytitle} /></Label>
        <div>
          <AddImageFileButton parentUiId={parentUiId} addImage={addImage} className="float-right" />
        </div>
      </div>
      <div className="p-1 border border-secondary rounded shadow gallery">
        {isLoading ? <Loading /> : thumbnails}
      </div>
    </>
  );
}

export default React.memo(GalleryComponent);
