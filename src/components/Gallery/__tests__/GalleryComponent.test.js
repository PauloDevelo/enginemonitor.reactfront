import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import React from 'react';
import { mount } from 'enzyme';

import GalleryComponent from '../GalleryComponent';
import localforage from 'localforage';

jest.mock('../../../services/ImageProxy');
jest.mock('localforage');

describe('Component GalleryComponent', () =>{
    const parentUiId = "equipment_01";

    const images = [
        {   name: "DJI_1645.JPG",
            parentUiId: parentUiId,
            sizeInByte: 262985,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339188DJI_1645.JPG.jpeg",
            _uiId: "dfc66510-f5f3-11e9-b3b1-f7086d79fbca"
        },
        {
            name: "DSC_0016.JPG",
            parentUiId: parentUiId,
            sizeInByte: 325323,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358072thumbnail_DSC_0016.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358061DSC_0016.JPG.jpeg",
            _uiId: "eb074110-f5f3-11e9-b3b1-f7086d79fbca"
        },
        {
            name: "DSC_0005.JPG",
            parentUiId: parentUiId,
            sizeInByte: 239719,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420022thumbnail_DSC_0005.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420020DSC_0005.JPG.jpeg",
            _uiId: "0ff4fd50-f5f4-11e9-b3b1-f7086d79fbca"
        },
    ];

    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("[React Intl] Could not find required `intl` object.");
        
    });

    beforeEach(() => {
    });

    afterEach(() => {
    })

    it('should render a list of image using the thumbnail url', async () => {
        // Arrange
        const onClickThumbnail = jest.fn();
        const addImage = jest.fn();
        const turnOnCamera = jest.fn();
        
        // Act
        const galleryComponent = mount(<GalleryComponent parentUiId={parentUiId} images={images} onClickThumbnail={onClickThumbnail} addImage={addImage} turnOnCamera={turnOnCamera}/>);
        await updateWrapper(galleryComponent);

        // Assert
        var thumbnails = galleryComponent.find('Memo(Thumbnail)');
        expect(thumbnails.length).toBe(3);
        for(let i = 0; i < 3; i++){
            expect(thumbnails.at(i).props().image).toBe(images[i]);
        }

        expect(onClickThumbnail).toHaveBeenCalledTimes(0);
        expect(addImage).toHaveBeenCalledTimes(0);
        expect(turnOnCamera).toHaveBeenCalledTimes(0);

        expect(galleryComponent).toMatchSnapshot();
    });

    it('should call onClickThumbnail function with the correct index when we click on a thumbnail', async () => {
        // Arrange
        const onClickThumbnail = jest.fn();
        const addImage = jest.fn();
        const turnOnCamera = jest.fn();

        const galleryComponent = mount(<GalleryComponent parentUiId={parentUiId} images={images} onClickThumbnail={onClickThumbnail} addImage={addImage} turnOnCamera={turnOnCamera}/>);
        await updateWrapper(galleryComponent);

        var thumbnails = galleryComponent.find('Memo(Thumbnail)');
        
        for(let index = 0; index < 3; index++){
            // Act
            thumbnails.at(index).find('img').simulate('click');

            // Assert
            expect(onClickThumbnail.mock.calls[index][0]).toBe(index);
        }
        
        expect(onClickThumbnail).toHaveBeenCalledTimes(3);
        expect(addImage).toHaveBeenCalledTimes(0);
        expect(turnOnCamera).toHaveBeenCalledTimes(0);
    });

    it('should call turnOnCamera function when we click on the camera button', async () => {
        // Arrange
        const onClickThumbnail = jest.fn();
        const addImage = jest.fn();
        const turnOnCamera = jest.fn();

        const galleryComponent = mount(<GalleryComponent parentUiId={parentUiId} images={images} onClickThumbnail={onClickThumbnail} addImage={addImage} turnOnCamera={turnOnCamera}/>);
        await updateWrapper(galleryComponent);

        var cameraButton = galleryComponent.find('Button').at(1);
        
        cameraButton.simulate('click');
        
        expect(onClickThumbnail).toHaveBeenCalledTimes(0);
        expect(addImage).toHaveBeenCalledTimes(0);
        expect(turnOnCamera).toHaveBeenCalledTimes(1);
    });

});