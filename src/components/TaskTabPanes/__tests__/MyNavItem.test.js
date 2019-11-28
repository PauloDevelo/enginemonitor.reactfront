import React from 'react';
import { mount } from 'enzyme';

import ignoredMessages from '../../../testHelpers/MockConsole';

import MyNavItem from '../MyNavItem';

describe('MyNavItem', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
  });

  beforeEach(() => {
  });

  it('should render a MyNavItem', () => {
    // Arrange
    const message = { id: 'tooltip', defaultMessage: 'hello world', description: 'a tooltip' };

    // Act
    const wrapper = mount(<MyNavItem label={message} />);

    // Assert
    expect(wrapper).toMatchSnapshot();
  });

  it('should call the function onClick when the user click on the tab', () => {
    // Arrange
    const message = { id: 'tooltip', defaultMessage: 'hello world', description: 'a tooltip' };
    const activeFunc = jest.fn();

    const wrapper = mount(<MyNavItem label={message} activeFunc={activeFunc} />);

    // Act
    wrapper.find('NavLink').simulate('click');

    // Assert
    expect(activeFunc).toBeCalledTimes(1);
  });
});
