import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';

// eslint-disable-next-line no-unused-vars
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UID } from 'react-uid';

type ToolTipProps = {
tooltip: MessageDescriptor
};

export default function ToolTip({ tooltip }: ToolTipProps) {
  return (
    <UID>
      {(id) => (
        <>
          <span id={`tooltip${id}`}>
            {' '}
            <FontAwesomeIcon icon={faQuestion} size="xs" color="grey" />
          </span>
          <UncontrolledTooltip target={`tooltip${id}`}>
            <FormattedMessage {...tooltip} />
          </UncontrolledTooltip>
        </>
      )}
    </UID>
  );
}
