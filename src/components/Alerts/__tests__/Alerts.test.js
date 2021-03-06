import React from 'react';
import { shallow, mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';

import Alerts from '../Alerts';

describe('Component Alert', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
  });

  it('should render even without props', () => {
    const wrapper = shallow(<Alerts />);

    expect(wrapper).toContainExactlyOneMatchingElement('Fragment');
    expect(wrapper.contains(<></>)).toEqual(true);
  });

  it('should render with a message and the default color', () => {
    const message = 'test message';
    const wrapper = mount(<Alerts error={message} />);

    expect(wrapper.text()).toEqual(message);
    expect(wrapper.find('div').hasClass('alert')).toEqual(true);
    expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
  });

  it('should render with a message and a secondary color', () => {
    const message = 'test message';
    const wrapper = mount(<Alerts error={message} color="secondary" />);

    expect(wrapper.text()).toEqual(message);
    expect(wrapper.find('div').hasClass('alert')).toEqual(true);
    expect(wrapper.find('div').hasClass('alert-secondary')).toEqual(true);
  });

  it('should render with a composed message and a danger color', () => {
    const wrapper = mount(<Alerts errors={{ email: 'isrequired' }} />);

    expect(wrapper.text()).toEqual('Email is required');
    expect(wrapper.find('div').hasClass('alert')).toEqual(true);
    expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
  });

  it('should render with an unexpected composed message and a danger color', () => {
    const wrapper = mount(<Alerts errors={{ unexpectedField: 'unexpectedMesg' }} />);

    expect(wrapper.text()).toEqual('unexpectedField unexpectedMesg');
    expect(wrapper.find('div').hasClass('alert')).toEqual(true);
    expect(wrapper.find('div').hasClass('alert-danger')).toEqual(true);
  });
});
