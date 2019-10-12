import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import MyInput from '../MyInput'

const mockConsoleMethod = (realConsoleMethod) => {
    const ignoredMessages = [
        "[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback."
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

const defaultMessage = {
    id: "defaultId",
    defaultMessage: "Default message",
    description: "Label"
};

describe("MyInput", () => {
    it("of type text should render as expected", () => {
        // Arrange

        const wrapper = mount(<MyInput name="name" 	label={defaultMessage} 	    type="text" 	required/>);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('label').text()).toEqual(defaultMessage.defaultMessage);
        expect(wrapper.find('input').prop('required')).toEqual(true);
        expect(wrapper.find('input').prop('type')).toEqual('text');
        expect(wrapper.find('input').prop('name')).toEqual('name');
    });

    it("of type checkox should render as expected", () => {
        // Arrange

        const wrapper = mount(<MyInput name="name" 	label={defaultMessage} 	    type="checkbox" 	required/>);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('label').text()).toEqual(defaultMessage.defaultMessage + ' ');
        expect(wrapper.find('input').prop('required')).toEqual(true);
        expect(wrapper.find('input').prop('type')).toEqual('checkbox');
        expect(wrapper.find('input').prop('name')).toEqual('name');
    }); 
});