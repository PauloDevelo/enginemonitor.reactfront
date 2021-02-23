// eslint-disable-next-line no-use-before-define
import React, { useState, useEffect } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';

import timeService from '../../services/TimeService';

const ClockLabel = () => {
  const [currentDate, setCurrentDate] = useState(timeService.getUTCDateTime());

  useEffect(() => {
    const intervalID = setInterval(
      () => setCurrentDate(timeService.getUTCDateTime()),
      1000,
    );
    // Specify how to clean up after this effect:
    return function cleanup() {
      clearInterval(intervalID);
    };
  }, []);

  return (
    <span>
      <FormattedDate value={currentDate} />
      <span> </span>
      <FormattedTime value={currentDate} hour="numeric" minute="numeric" second="numeric" />
    </span>
  );
};

export default ClockLabel;
