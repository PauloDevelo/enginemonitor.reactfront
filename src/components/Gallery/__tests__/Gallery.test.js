import ignoredMessages from '../../../testHelpers/MockConsole';

import React from 'react';
import { mount } from 'enzyme';

import imageProxy from '../../../services/ImageProxy';
import Gallery from '../Gallery';

jest.mock('../../../services/ImageProxy');

describe('Component Gallery', () =>{
    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("test was not wrapped in act(...)");
    });

    it('should render a list of image using the thumbnail url', () => {
        // Arrange
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

        imageProxy.fetchImages.mockResolvedValue(images);
        
        // Act
        const wrapper = mount(<Gallery parentUiId={parentUiId} />);
        
        // Assert
        return Promise
            .resolve(wrapper)
            .then(() => {
                wrapper.update();

                expect(wrapper).toMatchSnapshot();
            });
    });
});