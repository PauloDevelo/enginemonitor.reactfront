import HttpError from '../HttpError';

describe('Test HttpError', () => {
  beforeEach(() => {
  });

  afterEach(async () => {
  });

  const httpErrorParams = [
    {
      error: undefined,
      expectedTimeOut: false,
    },
    {
      error: new Error('my error message'),
      expectedTimeOut: false,
    },
    {
      error: { code: 'something that is not timeout' },
      expectedTimeOut: false,
    },
    {
      error: { code: 'ECONNABORTED' },
      expectedTimeOut: true,
    },

  ];

  describe.each(httpErrorParams)('didTimeOut', ({ error, expectedTimeOut }) => {
    it(`when ${JSON.stringify({ error, expectedTimeOut })}`, async () => {
      // Arrange
      const httpError = new HttpError({ emailinvalid: 'p.t@@vf.f' }, error);

      // Act
      const timeOut = httpError.didConnectionAbort();

      // Assert
      expect(timeOut).toBe(expectedTimeOut);
    });
  });
});
