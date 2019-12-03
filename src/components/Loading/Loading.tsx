import React from 'react';

import './Loading.css';

type Props = {
  classNames?: string;
  onClick?: (() => void);
}

const Loading = ({ classNames, onClick }: Props) => {
  const className = classNames !== undefined ? `${classNames} lds-spinner` : 'lds-spinner';

  return (
    <div className={className} onClick={onClick}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default Loading;
