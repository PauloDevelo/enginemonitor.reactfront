import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import global from '../../../global';

// eslint-disable-next-line no-unused-vars
import ignoredMessages from '../../../testHelpers/MockConsole';
import ModalAbout from '../ModalAbout';

jest.mock('localforage');
jest.mock('../../../global');

describe('Modal About', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('Please update the following components: ReactImageLightbox');
    ignoredMessages.push('Error: [@formatjs/intl Error MISSING_TRANSLATION]');
  });

  beforeEach(() => {

  });

  afterEach(() => {

  });

  it('should render a modal about', async () => {
    // Arrange
    global.getAppVersion.mockImplementation(() => '2.9.12');
    const toggle = jest.fn();

    // Act
    const modalAbout = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ModalAbout visible toggle={toggle} /></IntlProvider>);

    // Assert
    expect(modalAbout).toMatchSnapshot();
  });
});
