import React from 'react';
import { MessageDescriptor, injectIntl, IntlShape } from 'react-intl';

type Props = {
    value: number,
    message: MessageDescriptor,
    intl: IntlShape
}

const TranslatedOption = ({value, message, intl}:Props) => {
    const {formatMessage} = intl;

    return (
        <option value={value}> {formatMessage(message)}</option>
    );
};

export default injectIntl(TranslatedOption);