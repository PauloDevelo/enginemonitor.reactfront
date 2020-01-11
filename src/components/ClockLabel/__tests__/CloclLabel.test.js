import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import ClockLabel from '../ClockLabel';

import ignoredMessages from '../../../testHelpers/MockConsole';
// eslint-disable-next-line no-unused-vars
import timeService from '../../../services/TimeService';

import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/TimeService');

describe('ClocLabel', () => {
  beforeEach(() => {
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('a test was not wrapped in act');
    ignoredMessages.push('Could not find required `intl` object.');
  });

  afterEach(async () => {
    timeService.getUTCDateTime.mockRestore();
  });

  it('should Render the clock as expected', async (done) => {
    // Arrange utc: 2019-11-24T12:51:00.000Z
    const utcDate = new Date();
    utcDate.setUTCFullYear(2019);
    utcDate.setUTCMonth(10);
    utcDate.setUTCDate(24);
    utcDate.setUTCHours(12);
    utcDate.setUTCMinutes(51);
    utcDate.setUTCSeconds(0);
    utcDate.setUTCMilliseconds(0);

    jest.spyOn(timeService, 'getUTCDateTime').mockImplementation(() => utcDate);

    // Act
    const clockLabelWrapper = mount(<IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur"><ClockLabel /></IntlProvider>);
    await updateWrapper(clockLabelWrapper);

    // Assert
    expect(clockLabelWrapper).toMatchSnapshot();

    expect(timeService.getUTCDateTime).toBeCalledTimes(1);

    clockLabelWrapper.unmount();
    done();
  });
});
