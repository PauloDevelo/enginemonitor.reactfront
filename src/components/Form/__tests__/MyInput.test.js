import React from 'react';
import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';

import MyInput from '../MyInput';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

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
    expect(wrapper.find('FormFeedback').length).toBe(0);
  });

  it('of type text with an error should render as expected', async () => {
    // Arrange
    const wrapper = mount(<MyInput name="name" label={defaultMessage} type="text" required validationTrigger={0} />);
    const newProps = {
      name: 'name', label: defaultMessage, type: 'text', required: true, validationTrigger: 1,
    };

    // Act
    wrapper.setProps(newProps);
    await updateWrapper(wrapper);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('FormFeedback').length).toBe(1);
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
    expect(wrapper.find('FormFeedback').length).toBe(0);
  });

  it('of type checkox with an error should render as expected', async () => {
    // Arrange
    const newprops = {
      name: 'name', label: defaultMessage, type: 'checkbox', required: true, validationTrigger: 1,
    };
    const wrapper = mount(<MyInput name="name" label={defaultMessage} type="checkbox" required validationTrigger={0} checked={false} />);

    // Act
    wrapper.setProps(newprops);
    await updateWrapper(wrapper);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('FormFeedback').length).toBe(1);
  });
});
