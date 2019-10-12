import React, { Fragment } from "react";
import { Button, Spinner } from 'reactstrap';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

type Props = {
    color: string,
    isActing: boolean,
    message: FormattedMessage.MessageDescriptor,
    action?: () => void,
    className?: string,
    type?: "submit" | "button" | "reset",
    form?: string
};

const ActionButton = ({color, isActing, message, action, className, type, ...props}:Props) => {
    if (type === undefined){
        type = 'button';
    }

    return <Button type={type} color={color} onClick={action} className={className} disabled={isActing} {...props}>
        <FormattedMessage {...message} />
        {isActing && <Fragment>{' '}<Spinner size="sm" color="secondary" /></Fragment>}
    </Button>;
};

export default ActionButton;