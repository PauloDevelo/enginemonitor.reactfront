import React from 'react';

import { FormattedMessage } from 'react-intl';

import './HorizontalSeparationWithTitle.css';

const HorizontalSeparationWithTitle = ({ title }: {title: any}) => (
  <h4 className="with-horizontal-line"><span><FormattedMessage {...title} /></span></h4>
);

export default HorizontalSeparationWithTitle;
