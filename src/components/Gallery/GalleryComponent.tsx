import React, { Fragment } from 'react';
import { Label, Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';

import Thumbnail from './Thumbnail';

import { ImageModel } from '../../types/Types';
import AddImageFileButton from './AddImageFileButton';

import { faCamera, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import "./Gallery.css";

import {defineMessages} from "react-intl";
import jsonMessages from "./Gallery.messages.json";
const galleryMsg = defineMessages(jsonMessages);

type Props = {
    parentUiId: string,
    images: ImageModel[],
    onClickThumbnail: (index: number) => void,
    addImage: (image: ImageModel) => void,
    turnOnCamera: () => void
};

function GalleryComponent({ parentUiId, images, onClickThumbnail, addImage, turnOnCamera }: Props){
    const thumbnails = images.map((image, index) => {
        return <Thumbnail key={image._uiId} image={image} onClickImage={() => onClickThumbnail(index)} />;
    });

	return(
        <Fragment>
            <div className="flex-row top-padding-4px">
                <Label className="font-weight-bold"><FormattedMessage {...galleryMsg.gallerytitle}/></Label>
                <div>
                    <AddImageFileButton parentUiId={parentUiId} addImage={addImage} className="float-right"/>
                    <Button color="light" onClick={turnOnCamera} className="float-right">
                        <span className="fa-layers fa-fw">
                            <FontAwesomeIcon icon={faCamera} size="lg"/>
                            <FontAwesomeIcon icon={faPlus} size="xs" transform="down-13 left-16"/>
                        </span>
                    </Button>
                </div>
            </div>
            <div className="p-1 border border-secondary rounded shadow gallery">
                {thumbnails}
            </div>
        </Fragment>
	);
}

export default React.memo(GalleryComponent);