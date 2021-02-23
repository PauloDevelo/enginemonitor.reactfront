import React from 'react';
import { IntlProvider } from 'react-intl';
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
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  it('of type text should render as expected', () => {
    // Arrange

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyInput name="name" label={defaultMessage} type="text" required />
      </IntlProvider>,
    );

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
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyInput name="name" label={defaultMessage} type="text" required validationTrigger={0} />
      </IntlProvider>,
    );

    const newProps = {
      children: <MyInput name="name" label={defaultMessage} type="text" required validationTrigger={1} checked={false} />,
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

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyInput name="name" label={defaultMessage} type="checkbox" required />
      </IntlProvider>,
    );

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
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyInput name="name" label={defaultMessage} type="checkbox" required validationTrigger={0} checked={false} />
      </IntlProvider>,
    );

    // Act
    wrapper.setProps({ children: <MyInput name="name" label={defaultMessage} type="checkbox" required validationTrigger={1} checked={false} /> });
    await updateWrapper(wrapper);

    // Assert
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('FormFeedback').length).toBe(1);
  });
});
