import React from 'react';
import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';

import MyInput from '../MyInput';

const defaultMessage = {
  id: 'defaultId',
  defaultMessage: 'Default message',
  description: 'Label',
};

describe('MyInput', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
  });

  it('of type text should render as expected', () => {
    // Arrange

    const wrapper = mount(<MyInput name="name" label={defaultMessage} type="text" required />);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('label').text()).toEqual(defaultMessage.defaultMessage);
    expect(wrapper.find('input').prop('required')).toEqual(true);
    expect(wrapper.find('input').prop('type')).toEqual('text');
    expect(wrapper.find('input').prop('name')).toEqual('name');
  });

  it('of type checkox should render as expected', () => {
    // Arrange

    const wrapper = mount(<MyInput name="name" label={defaultMessage} type="checkbox" required />);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('label').text()).toEqual(`${defaultMessage.defaultMessage} `);
    expect(wrapper.find('input').prop('required')).toEqual(true);
    expect(wrapper.find('input').prop('type')).toEqual('checkbox');
    expect(wrapper.find('input').prop('name')).toEqual('name');
  });
});
