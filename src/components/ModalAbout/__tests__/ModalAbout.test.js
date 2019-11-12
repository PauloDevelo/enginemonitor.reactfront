
import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';
import ModalAbout from '../ModalAbout';

jest.mock('localforage');

describe('Modal About', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('Please update the following components: ReactImageLightbox');
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
  });

  beforeEach(() => {

  });

  afterEach(() => {

  });

  it('should render a modal about', async () => {
    // Arrange
    const toggle = jest.fn();

    // Act
    const modalAbout = mount(<ModalAbout visible toggle={toggle} />);

    // Assert
    expect(modalAbout).toMatchSnapshot();
  });
});
