/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */

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
