import React, { useState, useEffect } from 'react';
import { Progress } from 'reactstrap';

type Props = {
    storageSizeInMB: number,
    storageSizeLimitInMB: number
};

const getColorProgress = (size: number, sizeLimit: number):string => {
  const ratio = size / sizeLimit;

  if (ratio < 0.5) {
    return 'success';
  }
  if (ratio >= 0.5 && ratio < 0.75) {
    return 'warning';
  }

  return 'danger';
};

const formatMbInCurrentCulture = (sizeInMb: number):string => new Intl.NumberFormat(window.navigator.languages[0], { maximumSignificantDigits: 2 }).format(sizeInMb);

const ImageFolderGauge = ({ storageSizeInMB, storageSizeLimitInMB }:Props) => {
  const [color, setColor] = useState(getColorProgress(storageSizeInMB, storageSizeLimitInMB));

  useEffect(() => {
    setColor(getColorProgress(storageSizeInMB, storageSizeLimitInMB));
  }, [storageSizeInMB, storageSizeLimitInMB]);

  return (
    <Progress color={color} value={storageSizeInMB} max={storageSizeLimitInMB}>
      {formatMbInCurrentCulture(storageSizeInMB)}
      {' '}
      of
      {' '}
      {formatMbInCurrentCulture(storageSizeLimitInMB)}
      MB
    </Progress>
  );
};

export default React.memo(ImageFolderGauge);
