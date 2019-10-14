import React, { Fragment } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { FormattedMessage } from 'react-intl';

import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {UID} from 'react-uid';

import PropTypes from 'prop-types';

type ToolTipProps = {
	tooltip: FormattedMessage.MessageDescriptor
};

export default function ToolTip({tooltip}: ToolTipProps) {
	return (
		<UID>
			{id => (
				<Fragment>
					<span id={'tooltip' + id}>{' '}<FontAwesomeIcon icon={faQuestion} size="xs" color="grey"/></span>
					<UncontrolledTooltip target={'tooltip' + id}>
						<FormattedMessage {...tooltip} />
					</UncontrolledTooltip>
				</Fragment>
			)}
		</UID>
	);
}

ToolTip.propTypes = {
	tooltip: PropTypes.object.isRequired
};