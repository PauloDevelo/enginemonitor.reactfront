import React from 'react';
import { mount } from 'enzyme';

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
    ignoredMessages.push('Could not find required `intl` object.');
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
    it(`should display the connection when isOnline is ${isOnline} and the application is synced ${isSynced}`, async (done) => {
      // Arrange

      // Act
      const connectionStateMessageWrapper = mount(<ConnectionStateMessage isOnline={isOnline} isSynced={isSynced} />);

      // Assert
      expect(connectionStateMessageWrapper).toMatchSnapshot();
      done();
    });
  });
});
