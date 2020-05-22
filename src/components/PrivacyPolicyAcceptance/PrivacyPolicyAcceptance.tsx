import React, {
  useEffect, useState, useCallback,
} from 'react';

import {
  Toast, ToastHeader, ToastBody, Button, ModalFooter,
} from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import PrivacyPolicyModal from '../PrivacyPolicyModal/PrivacyPolicyModal';

// eslint-disable-next-line no-unused-vars
import storageService, { IUserStorageListener } from '../../services/StorageService';

import jsonMessages from './PrivacyPolicyAcceptance.messages.json';

import './PrivacyPolicyAcceptance.css';

const msg = defineMessages(jsonMessages);


export default function PrivacyPolicyAcceptance() {
  const [alertPrivacyPolicyVisibility, setAlertPrivacyPolicyVisibility] = useState(false);

  useEffect(() => {
    const userStorageListener:IUserStorageListener = {
      onUserStorageOpened: async (): Promise<void> => {
        storageService.getItem<boolean>('privacyPolicyAccepted').then((privacyPolicyAcceptedValue) => {
          setAlertPrivacyPolicyVisibility(!privacyPolicyAcceptedValue);
        });
      },
      onUserStorageClosed: async (): Promise<void> => {

      },
    };

    storageService.registerUserStorageListener(userStorageListener);
  }, []);

  const acceptPrivacyPolicy = useCallback(() => {
    storageService.setItem<boolean>('privacyPolicyAccepted', true);
    setAlertPrivacyPolicyVisibility(false);
  }, []);

  const [privacyPolicyVisibility, setPrivacyPolicyVisibility] = useState(false);

  const togglePrivacyPolicyContent = useCallback((event? : any) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    setPrivacyPolicyVisibility((prevPrivacyPolicyVisibility) => !prevPrivacyPolicyVisibility);
  }, []);

  const privacyPolicyAcceptanceLine3 = {
    ...msg.privacyPolicyAcceptanceUsingAWindow3,
    values: {
      privatePolicyLink: <a href="_" onClick={togglePrivacyPolicyContent}><FormattedMessage {...msg.privacyPolicy} /></a>,
    },
  };

  return (
    <>
      {alertPrivacyPolicyVisibility && <div className="modal-backdrop fade show" />}
      <Toast isOpen={alertPrivacyPolicyVisibility} className="fixed-position-bottom-right very-top">
        <ToastHeader icon="warning"><FormattedMessage {...msg.privacyPolicyMenu} /></ToastHeader>
        <ToastBody>
          <FormattedMessage {...msg.privacyPolicyAcceptanceUsingAWindow1} />
          <br />
          <FormattedMessage {...msg.privacyPolicyAcceptanceUsingAWindow2} />
          <br />
          <br />
          <FormattedMessage {...privacyPolicyAcceptanceLine3} />
        </ToastBody>
        <ModalFooter>
          <Button color="success" onClick={acceptPrivacyPolicy}><FormattedMessage {...msg.accept} /></Button>
        </ModalFooter>
      </Toast>
      <PrivacyPolicyModal visible={privacyPolicyVisibility} toggle={togglePrivacyPolicyContent} className="modal-dialog-centered" />
    </>
  );
}
