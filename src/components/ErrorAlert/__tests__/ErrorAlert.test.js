import React from 'react';
import { mount } from 'enzyme';

import ErrorAlert from '../ErrorAlert';
import HttpError from '../../../http/HttpError';

describe('Component ErrorAlert', () => {
  it('when it gets an Error should render with a message and the default color', () => {
    // Arrange
    const error = new Error('test message');
    const onDismiss = () => {};

    // Act
    const wrapper = mount(<ErrorAlert error={error} onDismiss={onDismiss} />);

    // Assert
    expect(wrapper.text()).toEqual('×test message');
    expect(wrapper.find('div').get(0).props.className.split(' ').findIndex((i) => i === 'alert') !== -1).toEqual(true);
    expect(wrapper.find('div').get(0).props.className.split(' ').findIndex((i) => i === 'alert-danger') !== -1).toEqual(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('when it gets an HttpError should render with a message and the default color', () => {
    // Arrange
    const error = new HttpError({ message: 'test message' });
    const onDismiss = () => {};

    // Act
    const wrapper = mount(<ErrorAlert error={error} onDismiss={onDismiss} />);

    // Assert
    expect(wrapper.text()).toEqual('×test message');
    expect(wrapper.find('div').get(0).props.className.split(' ').findIndex((i) => i === 'alert') !== -1).toEqual(true);
    expect(wrapper.find('div').get(0).props.className.split(' ').findIndex((i) => i === 'alert-danger') !== -1).toEqual(true);
    expect(wrapper).toMatchSnapshot();
  });
});
