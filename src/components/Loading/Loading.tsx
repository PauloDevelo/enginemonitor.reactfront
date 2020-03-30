import React from 'react';

import classnames from 'classnames';

import './Loading.css';

type Props = {
  className?: string;
  onClick?: (() => void);
}

const Loading = ({ className, onClick }: Props) => (
  <div className={classnames(className, 'lds-spinner')} onClick={onClick}>
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

export default Loading;
