import React from 'react';
import { mount } from 'enzyme';

import AddImageFileButton from '../AddImageFileButton';

describe('Component Thumbnail', () => {
  it('should render an button', () => {
    // Arrange
    const onImageAdded = jest.fn();

    // Act
    const buttonAddImage = mount(<AddImageFileButton parentUiId="parent_01" addImage={onImageAdded} />);

    // Assert
    expect(buttonAddImage).toMatchSnapshot();
  });
});
