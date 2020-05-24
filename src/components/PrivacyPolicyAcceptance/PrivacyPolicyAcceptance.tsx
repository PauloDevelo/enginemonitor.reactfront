import React, {
  useEffect, useState, useCallback,
} from 'react';

import {
  Toast, ToastHeader, ToastBody,
} from 'reactstrap';

import moment from 'moment';

import { FormattedMessage, defineMessages } from 'react-intl';

import PrivacyPolicyModal from '../PrivacyPolicyModal/PrivacyPolicyModal';

// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from '../../services/StorageService';

import jsonMessages from './PrivacyPolicyAcceptance.messages.json';

import './PrivacyPolicyAcceptance.css';


const msg = defineMessages(jsonMessages);


export default function PrivacyPolicyAcceptance() {
  const [alertPrivacyPolicyVisibility, setAlertPrivacyPolicyVisibility] = useState<boolean>(false);

  useEffect(() => {
    const userStorageListener:IUserStorageListener = {
      onUserStorageOpened: async (): Promise<void> => {
        storageService.getItem<string>('privacyPolicyAccepted').then((privacyPolicyAcceptedValue) => {
          const acceptanceLimit = moment().subtract(3, 'month');
          const lastAcceptanceDate = privacyPolicyAcceptedValue ? moment(privacyPolicyAcceptedValue, moment.ISO_8601, true) : undefined;
          const alertPrivacyPolicyVisibilityValue = lastAcceptanceDate === undefined || lastAcceptanceDate.isValid() === false || lastAcceptanceDate.isBefore(acceptanceLimit);
          setAlertPrivacyPolicyVisibility(alertPrivacyPolicyVisibilityValue);
        });
      },
      onUserStorageClosed: async (): Promise<void> => {
        setAlertPrivacyPolicyVisibility(false);
      },
    };

    storageService.registerUserStorageListener(userStorageListener);

    return () => storageService.unregisterUserStorageListener(userStorageListener);
  }, []);

  const acceptPrivacyPolicy = useCallback(() => {
    const now = moment().toISOString();
    storageService.setItem('privacyPolicyAccepted', now);
    setAlertPrivacyPolicyVisibility(false);
  }, []);

  const [privacyPolicyVisibility, setPrivacyPolicyVisibility] = useState(false);

  const togglePrivacyPolicyContent = useCallback((event? : any) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    setPrivacyPolicyVisibility((prevPrivacyPolicyVisibility) => !prevPrivacyPolicyVisibility);
  }, []);

  const privacyPolicyAcceptanceLine2 = {
    ...msg.privacyPolicyAcceptanceUsingAWindow2,
    values: {
      privatePolicyLink: <a href="_" onClick={togglePrivacyPolicyContent}><FormattedMessage {...msg.privacyPolicy} /></a>,
    },
  };

  return (
    <>
      <Toast isOpen={alertPrivacyPolicyVisibility} className="fixed-position-bottom-right">
        <ToastHeader icon="warning" toggle={acceptPrivacyPolicy}><FormattedMessage {...msg.privacyPolicyMenu} /></ToastHeader>
        <ToastBody>
          <FormattedMessage {...msg.privacyPolicyAcceptanceUsingAWindow1} />
          <br />
          <br />
          <FormattedMessage {...privacyPolicyAcceptanceLine2} />
        </ToastBody>
      </Toast>
      <PrivacyPolicyModal visible={privacyPolicyVisibility} toggle={togglePrivacyPolicyContent} className="modal-dialog-centered" />
    </>
  );
}
