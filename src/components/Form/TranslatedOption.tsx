// eslint-disable-next-line no-use-before-define
import React from 'react';

// eslint-disable-next-line no-unused-vars
import { MessageDescriptor, injectIntl, IntlShape } from 'react-intl';

type Props = {
    value: number,
    message: MessageDescriptor,
    intl: IntlShape
}

const TranslatedOption = ({ value, message, intl }:Props) => {
  const { formatMessage } = intl;

  return (
    <option value={value}>
      {' '}
      {formatMessage(message)}
    </option>
  );
};

export default injectIntl(TranslatedOption);
