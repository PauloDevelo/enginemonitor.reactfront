import React, { Fragment } from 'react';
import { shallow, mount } from 'enzyme';

import Alerts from '../Alerts'

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

    it.only('should render with an unexpected composed message and a danger color', () => {
        const wrapper = mount(<Alerts errors={ {unexpectedField: 'unexpectedMesg'} } />);

        expect(wrapper.text()).toEqual('unexpectedField unexpectedMesg');
        expect(wrapper.find('div').hasClass('alert')).toEqual(true);
        expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
    });
});