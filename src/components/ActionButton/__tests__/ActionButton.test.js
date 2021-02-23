import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import ignoredMessages from '../../../testHelpers/MockConsole';

import ActionButton from '../ActionButton';

describe('Component ActionButton', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  it('should render as a simple button', () => {
    const message = { id: 'message', defaultMessage: 'defaultMessage', description: 'description' };
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ActionButton message={message} /></IntlProvider>);

    expect(wrapper.text()).toEqual(message.defaultMessage);
    expect(wrapper.find('button').hasClass('btn')).toEqual(true);
  });

  it('should render as a simple button with the color color', () => {
    const message = { id: 'message', defaultMessage: 'defaultMessage', description: 'description' };
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ActionButton message={message} color="danger" /></IntlProvider>);

    expect(wrapper.text()).toEqual(message.defaultMessage);
    expect(wrapper.find('button').hasClass('btn-danger')).toEqual(true);
  });

  it('should render as a simple button disable with the danger color and a spinner', () => {
    const message = { id: 'message', defaultMessage: 'defaultMessage', description: 'description' };
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ActionButton message={message} color="danger" isActing /></IntlProvider>);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render as a simple button enable with the danger color and without a spinner', () => {
    const message = { id: 'message', defaultMessage: 'defaultMessage', description: 'description' };
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ActionButton message={message} color="danger" isActing={false} /></IntlProvider>);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button clickable', () => {
    const message = { id: 'message', defaultMessage: 'defaultMessage', description: 'description' };
    const action = jest.fn();
    const wrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ActionButton message={message} color="danger" isActing={false} action={action} /></IntlProvider>);

    wrapper.find('button').simulate('click');

    expect(action.mock.calls.length).toEqual(1);
  });
});
