import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';

import {
  Button, Input, Fade,
} from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import {
  faShareAlt, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import jsonMessages from './GuestLink.messages.json';

// eslint-disable-next-line no-unused-vars
import { AssetModel, GuestLinkModel } from '../../types/Types';

import guestLinkProxy from '../../services/GuestLinkProxy';

const guestLinkMsg = defineMessages(jsonMessages);

type Type = {
    className?: string
    asset: AssetModel,
    onError?: (error:any) => void
}

const GuestLink = ({ asset, onError, className }:Type) => {
  const [guestLink, setGuestLink] = useState<GuestLinkModel | undefined>(undefined);
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  useEffect(() => {
    guestLinkProxy.getGuestLinks(asset._uiId)
      .then((guestLinks) => setGuestLink(guestLinks.length === 0 ? undefined : guestLinks[0]))
      .catch(() => setGuestLink(undefined));
  }, [asset]);

  const unshareCallBack = useCallback(async () => {
    if (guestLink !== undefined) {
      try {
        await guestLinkProxy.removeGuestLink(guestLink._uiId, asset._uiId);
        setGuestLink(undefined);
        if (onError) {
          onError(undefined);
        }
      } catch (reason) {
        if (onError) {
          onError(reason.data);
        }
      }
    }
  }, [guestLink, asset, onError]);

  const shareCallBack = useCallback(async () => {
    try {
      setGuestLink(await guestLinkProxy.createGuestLink(asset._uiId, 'Read only'));
      if (onError) {
        onError(undefined);
      }
    } catch (reason) {
      if (onError) {
        onError(reason.data);
      }
    }
  }, [asset, onError]);


  const [copied, setCopied] = useState(false);
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    setCopied(document.execCommand('copy'));

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  const getUrl = useCallback(() => (guestLink ? `${process.env.REACT_APP_URL}${guestLink.niceKey}` : ''), [guestLink]);

  return (
    <div className={classNames(className, 'p-1 mb-3 border border-secondary rounded shadow flex-row')}>
      {guestLink && <Button color="light" size="sm" onClick={unshareCallBack} aria-label="Share" style={{ alignSelf: 'flex-start' }}><FontAwesomeIcon icon={faTrash} /></Button>}
      {!guestLink && <Button color="light" size="sm" onClick={shareCallBack} aria-label="Share" style={{ alignSelf: 'flex-start' }}><FontAwesomeIcon icon={faShareAlt} /></Button>}
      <div className="flex-column" style={{ flex: 'auto' }}>
        <Input type="url" disable="true" value={getUrl()} inline="true" readOnly onFocus={handleFocus} valid={copied} />
        <Fade in={copied} tag="div" className="valid-feedback">
          <FormattedMessage {...guestLinkMsg.copiedMessage} />
        </Fade>
      </div>
    </div>
  );
};

export default GuestLink;
