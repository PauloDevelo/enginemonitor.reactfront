import React from 'react';
import { mount } from 'enzyme';


import Image from '../Image'



const mockConsoleMethod = (realConsoleMethod) => {
    const ignoredMessages = [
    ];

    return (message, ...args) => {
        const containsIgnoredMessage = ignoredMessages.some((ignoredMessage) => message.includes(ignoredMessage));

        if (!containsIgnoredMessage) {
        realConsoleMethod(message, ...args);
        }
    };
};
  
// Suppress console errors and warnings to avoid polluting output in tests.
console.warn = jest.fn(mockConsoleMethod(console.warn));
console.error = jest.fn(mockConsoleMethod(console.error));

describe('Component Image', () =>{
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
        const wrapper = mount(<Image image={image} onClickImage={onClick} />);
        
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
        const wrapper = mount(<Image image={image} onClickImage={onClick} />);

        // Act
        wrapper.find('img').simulate('click');
        
        // Assert
        expect(onClick.mock.calls.length).toEqual(1);
    });
});