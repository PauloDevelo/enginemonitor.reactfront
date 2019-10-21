import ignoredMessages from '../../../testHelpers/MockConsole';
import React from 'react';
import {  mount } from 'enzyme';

import ActionButton from '../ActionButton'

ignoredMessages.push("[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.");

describe('Component ActionButton', () =>{
    it('should render as a simple button', () => {
        const message = { id:"message", defaultMessage: "defaultMessage", description: "description"};
        const wrapper = mount(<ActionButton message={message}/>);

        expect(wrapper.text()).toEqual(message.defaultMessage);
        expect(wrapper.find('button').hasClass('btn')).toEqual(true);
    });

    it('should render as a simple button with the color color', () => {
        const message = { id:"message", defaultMessage: "defaultMessage", description: "description"};
        const wrapper = mount(<ActionButton message={message} color={"danger"}/>);

        expect(wrapper.text()).toEqual(message.defaultMessage);
        expect(wrapper.find('button').hasClass('btn-danger')).toEqual(true);
    });

    it('should render as a simple button disable with the danger color and a spinner', () => {
        const message = { id:"message", defaultMessage: "defaultMessage", description: "description"};
        const wrapper = mount(<ActionButton message={message} color={"danger"} isActing={true}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render as a simple button enable with the danger color and without a spinner', () => {
        const message = { id:"message", defaultMessage: "defaultMessage", description: "description"};
        const wrapper = mount(<ActionButton message={message} color={"danger"} isActing={false}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should render a button clickable', () => {
        const message = { id:"message", defaultMessage: "defaultMessage", description: "description"};
        const action = jest.fn();
        const wrapper = mount(<ActionButton message={message} color={"danger"} isActing={false} action= {action}/>);

        wrapper.find('button').simulate('click');

        expect(action.mock.calls.length).toEqual(1);
    });
});