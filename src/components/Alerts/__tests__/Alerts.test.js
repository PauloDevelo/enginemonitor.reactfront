import React, { Fragment } from 'react';
import { shallow, mount } from 'enzyme';

import Alerts from '../Alerts'

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

describe('Component Alert', () =>{
    it('should render even without props', () => {
        const wrapper = shallow(<Alerts />);

        expect(wrapper).toContainExactlyOneMatchingElement("Fragment");
        expect(wrapper.contains(<Fragment></Fragment>)).toEqual(true);
    });

    it('should render with a message and the default color', () => {
        const message = "test message";
        const wrapper = mount(<Alerts error={message}/>);

        expect(wrapper.text()).toEqual(message);
        expect(wrapper.find('div').hasClass('alert')).toEqual(true);
        expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
    });

    it('should render with a message and a secondary color', () => {
        const message = "test message";
        const wrapper = mount(<Alerts error={message} color="secondary"/>);

        expect(wrapper.text()).toEqual(message);
        expect(wrapper.find('div').hasClass('alert')).toEqual(true);
        expect(wrapper.find('div').hasClass('alert-secondary')).toEqual(true);
    });

    it('should render with a composed message and a danger color', () => {
        const wrapper = mount(<Alerts errors={ {email: 'isrequired'} } />);

        expect(wrapper.text()).toEqual('Email is required');
        expect(wrapper.find('div').hasClass('alert')).toEqual(true);
        expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
    });

    it('should render with an unexpected composed message and a danger color', () => {
        const wrapper = mount(<Alerts errors={ {unexpectedField: 'unexpectedMesg'} } />);

        expect(wrapper.text()).toEqual('unexpectedField unexpectedMesg');
        expect(wrapper.find('div').hasClass('alert')).toEqual(true);
        expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
    });
});