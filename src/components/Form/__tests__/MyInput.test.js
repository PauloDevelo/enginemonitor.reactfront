import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import MyInput from '../MyInput'

const defaultMessage = {
    id: "defaultId",
    defaultMessage: "Default message",
    description: "Label"
};

describe("MyInput", () => {
    it("Should render as expected", () => {
        // Arrange

        const wrapper = mount(<MyInput name="name" 	label={defaultMessage} 	    type="text" 	required/>);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('label').text()).toEqual(defaultMessage.defaultMessage);
        expect(wrapper.find('input').prop('required')).toEqual(true);
        expect(wrapper.find('input').prop('type')).toEqual('text');
        expect(wrapper.find('input').prop('name')).toEqual('name');
    });
});