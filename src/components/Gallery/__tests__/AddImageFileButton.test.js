import React from 'react';
import { mount } from 'enzyme';

import AddImageFileButton from '../AddImageFileButton';

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

describe('Component Thumbnail', () =>{
    it('should render an button', () => {
        // Arrange
        const onImageAdded = jest.fn();

        // Act
        const buttonAddImage = mount(<AddImageFileButton parentUiId={"parent_01"} addImage={onImageAdded} />);

        // Assert
        expect(buttonAddImage).toMatchSnapshot();
    });

    it('should render an button', () => {
        // Arrange

        // Act

        // Assert
    });
});