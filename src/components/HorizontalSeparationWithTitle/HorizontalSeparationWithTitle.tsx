// eslint-disable-next-line no-use-before-define
import React from 'react';

// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import './HorizontalSeparationWithTitle.css';

const HorizontalSeparationWithTitle = ({ title }: {title: MessageDescriptor}) => (
  <h4 className="with-horizontal-line"><span><FormattedMessage {...title} /></span></h4>
);

export default HorizontalSeparationWithTitle;
