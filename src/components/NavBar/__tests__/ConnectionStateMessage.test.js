import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ConnectionStateMessage from '../ConnectionStateMessage';

import ignoredMessages from '../../../testHelpers/MockConsole';

jest.mock('localforage');

describe('ConnectionStateMessage', () => {
  beforeEach(() => {
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[@formatjs/intl Error MISSING_TRANSLATION]');
  });

  afterEach(async () => {
  });

  const connectionStates = [
    { isOnline: true, isSynced: true },
    { isOnline: true, isSynced: false },
    { isOnline: false, isSynced: true },
    { isOnline: false, isSynced: false },
  ];

  describe.each(connectionStates)('Render', ({ isOnline, isSynced }) => {
    it(`should display the connection when isOnline is ${isOnline} and the application is synced ${isSynced}`, (done) => {
      // Arrange

      // Act
      const connectionStateMessageWrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ConnectionStateMessage isOnline={isOnline} isSynced={isSynced} /></IntlProvider>);

      // Assert
      expect(connectionStateMessageWrapper).toMatchSnapshot();
      done();
    });
  });
});
