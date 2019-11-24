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
    // Arrange
    jest.spyOn(timeService, 'getUTCDateTime').mockImplementation(() => new Date(2019, 10, 24, 20, 51));

    // Act
    const clockLabelWrapper = mount(<IntlProvider locale={navigator.language}><ClockLabel /></IntlProvider>);
    await updateWrapper(clockLabelWrapper);

    // Assert
    expect(clockLabelWrapper).toMatchSnapshot();

    expect(timeService.getUTCDateTime).toBeCalledTimes(1);

    clockLabelWrapper.unmount();
    done();
  });
});
