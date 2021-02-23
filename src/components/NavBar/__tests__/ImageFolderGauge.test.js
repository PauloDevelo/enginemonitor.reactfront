import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import ImageFolderGauge from '../ImageFolderGauge';

import ignoredMessages from '../../../testHelpers/MockConsole';

jest.mock('localforage');

describe('ImageFolderGauge', () => {
  beforeEach(() => {
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('Could not find required `intl` object.');
  });

  afterEach(() => {
  });

  const imageFolderStatus = [
    { storageSizeInMB: 35, storageSizeLimitInMB: 100 },
    { storageSizeInMB: 60, storageSizeLimitInMB: 100 },
    { storageSizeInMB: 85, storageSizeLimitInMB: 100 },
  ];

  describe.each(imageFolderStatus)('Render', ({ storageSizeInMB, storageSizeLimitInMB }) => {
    it(`should display the image gauge when ${storageSizeInMB} Mb are used over ${storageSizeLimitInMB}`, (done) => {
      // Arrange

      // Act
      const imageFolderGaugeWrapper = mount(<ImageFolderGauge storageSizeInMB={storageSizeInMB} storageSizeLimitInMB={storageSizeLimitInMB} />);

      // Assert
      expect(imageFolderGaugeWrapper).toMatchSnapshot();
      done();
    });
  });
});
