import React from 'react';
import { Button, Spinner } from 'reactstrap';

// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';

type Props = {
    color: string,
    isActing: boolean,
    disabled?: boolean,
    message: MessageDescriptor,
    action?: () => void,
    className?: string,
    type?: 'submit' | 'button' | 'reset',
    form?: string
};

const ActionButton = ({
  color, isActing, message, action, className, type, disabled, ...props
}:Props) => (
  <Button type={type || 'button'} color={color} onClick={action} className={className} disabled={isActing || disabled} {...props}>
    <FormattedMessage {...message} />
    {isActing && (
      <>
          {' '}
        <Spinner size="sm" color="secondary" />
      </>
    )}
  </Button>
);

export default ActionButton;
