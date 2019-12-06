import React from 'react';
import { Label, Button } from 'reactstrap';
import { FormattedMessage, defineMessages } from 'react-intl';
import { faCamera, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    addImage: (image: ImageModel) => void,
    turnOnCamera: () => void
};

function GalleryComponent({
  parentUiId, images, isLoading, onClickThumbnail, addImage, turnOnCamera,
}: Props) {
  const thumbnails = images.map((image, index) => <Thumbnail key={image._uiId} image={image} onClickImage={() => onClickThumbnail(index)} />);

  return (
    <>
      <div className="flex-row top-padding-4px">
        <Label className="font-weight-bold"><FormattedMessage {...galleryMsg.gallerytitle} /></Label>
        <div>
          <AddImageFileButton parentUiId={parentUiId} addImage={addImage} className="float-right" />
          <Button color="light" onClick={turnOnCamera} className="float-right">
            <span className="fa-layers fa-fw">
              <FontAwesomeIcon icon={faCamera} size="lg" />
              <FontAwesomeIcon icon={faPlus} size="xs" transform="down-13 left-16" />
            </span>
          </Button>
        </div>
      </div>
      <div className="p-1 border border-secondary rounded shadow gallery">
        {isLoading ? <Loading /> : thumbnails}
      </div>
    </>
  );
}

export default React.memo(GalleryComponent);
