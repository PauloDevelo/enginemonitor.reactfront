import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'reactstrap';

type Props = {
    delayInMs: number,
    children?: JSX.Element[] | JSX.Element,
    value?: string,
    className?: string,
    color: string
};

const TemporalAlert = ({
  delayInMs, children, className, color, value,
}:Props) => {
  const [isOpen, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  };

  useEffect(() => () => {
    clearTimer();
  }, []);

  useEffect(() => {
    setOpen((wasOpen) => {
      if ((children !== undefined || value !== undefined) && wasOpen === false) {
        clearTimer();
        timer.current = setTimeout(() => setOpen(false), delayInMs);
      }

      return (children !== undefined || value !== undefined);
    });
  }, [children, value, delayInMs]);

  return (
    <Alert className={className} color={color} isOpen={isOpen} fade>
      {value}
      {children}
    </Alert>
  );
};

export default TemporalAlert;
