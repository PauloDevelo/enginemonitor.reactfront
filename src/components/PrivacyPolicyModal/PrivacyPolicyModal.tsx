import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Media,
} from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import PrivacyPolicyModalBodyFr from './PrivacyPolicyModal.fr';
import PrivacyPolicyModalBodyEn from './PrivacyPolicyModal.en';

import jsonMessages from './PrivacyPolicyModal.messages.json';

const privacyMsg = defineMessages(jsonMessages);

type Props = {
visible?: boolean;
className?: string;
toggle?: ()=>void;
}

const privacyPolicyModalBodies = {
  fr: <PrivacyPolicyModalBodyFr />,
  en: <PrivacyPolicyModalBodyEn />,
};

const supportedLanguages = Object.keys(privacyPolicyModalBodies);
const { language } = navigator;
const shortLanguage = language.split(/[-_]/)[0];

const privacyPolicyModalBody = supportedLanguages.includes(shortLanguage) ? (privacyPolicyModalBodies as any)[shortLanguage] as JSX.Element : privacyPolicyModalBodies.en;


const PrivacyPolicyModal = ({ visible = true, className, toggle }: Props) => (
  <Modal isOpen={visible} toggle={toggle} className={className} fade size="lg">
    <ModalHeader toggle={toggle}>
      <Media left>
        <Media object src="./images/engine48.png" alt="Equipment Maintenance icon" />
      </Media>
      <Media body>
        <Media heading>
          <FormattedMessage {...privacyMsg.title} />
        </Media>
      </Media>
    </ModalHeader>
    {privacyPolicyModalBody}
    <ModalFooter>
      {toggle !== undefined && <Button color="success" onClick={toggle}><FormattedMessage {...privacyMsg.ok} /></Button>}
    </ModalFooter>
  </Modal>
);

export default PrivacyPolicyModal;
