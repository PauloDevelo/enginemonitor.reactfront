import React, { useState, useEffect } from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';

const ClockLabel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const intervalID = setInterval(
      () => setCurrentDate(new Date()),
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
