import React from 'react';
import { mount } from 'enzyme';

import Thumbnail from '../Thumbnail'

describe('Component Thumbnail', () =>{
    it('should render an image using the thumbnail url', () => {
        // Arrange
        const image = {url: "http://localhost:3000/image.jpeg",
            thumbnailUrl: "http://localhost:3000/thumbnail.jpeg",
            parentUiId: "parentUiId",
            title: "a title",
            description:"a desc",
            sizeInByte:"1234"};

        const onClick = jest.fn();

        // Act
        const wrapper = mount(<Thumbnail image={image} onClickImage={onClick} />);
        
        // Assert
        expect(wrapper.find('img').hasClass('thumbnail')).toEqual(true);
        expect(wrapper.find('img').hasClass('grow')).toEqual(true);
        expect(wrapper.find('img').props().src).toEqual(image.thumbnailUrl);
        expect(wrapper.find('img').props().alt).toEqual(image.title + " - " + image.description);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render a clickable image', () => {
        // Arrange
        const image = {url: "http://localhost:3000/image.jpeg",
            thumbnailUrl: "http://localhost:3000/thumbnail.jpeg",
            parentUiId: "parentUiId",
            title: "a title",
            description:"a desc",
            sizeInByte:"1234"};

        const onClick = jest.fn();
        const wrapper = mount(<Thumbnail image={image} onClickImage={onClick} />);

        // Act
        wrapper.find('img').simulate('click');
        
        // Assert
        expect(onClick.mock.calls.length).toEqual(1);
    });
});