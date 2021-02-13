import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount } from 'enzyme';

import ignoredMessages from '../../../testHelpers/MockConsole';

import MyNavItem from '../MyNavItem';

describe('MyNavItem', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[@formatjs/intl Error MISSING_TRANSLATION]');
  });

  beforeEach(() => {
  });

  it('should render a MyNavItem', () => {
    // Arrange
    const message = { id: 'tooltip', defaultMessage: 'hello world', description: 'a tooltip' };

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyNavItem label={message} />
      </IntlProvider>,
    );

    // Assert
    expect(wrapper).toMatchSnapshot();
  });

  it('should call the function onClick when the user click on the tab', () => {
    // Arrange
    const message = { id: 'tooltip', defaultMessage: 'hello world', description: 'a tooltip' };
    const activeFunc = jest.fn();

    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <MyNavItem label={message} activeFunc={activeFunc} />
      </IntlProvider>,
    );

    // Act
    wrapper.find('NavLink').simulate('click');

    // Assert
    expect(activeFunc).toBeCalledTimes(1);
  });
});
