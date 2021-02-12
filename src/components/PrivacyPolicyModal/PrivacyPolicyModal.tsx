import React, { useState, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalFooter, Media,
} from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import PrivacyPolicyModalBodyFr from './PrivacyPolicyModal.fr';
import PrivacyPolicyModalBodyEn from './PrivacyPolicyModal.en';
import DeleteUserModal from '../DeleteUserModal/DeleteUserModal';

import jsonMessages from './PrivacyPolicyModal.messages.json';

const privacyMsg = defineMessages(jsonMessages);

type Props = {
visible?: boolean;
className?: string;
toggle?: ()=>void;
}

const { language } = navigator;
const shortLanguage = language.split(/[-_]/)[0];


const PrivacyPolicyModal = ({ visible = true, className, toggle }: Props) => {
  const [deleteUserModalVis, setDeleteUserModalVis] = useState(false);

  const toggleDeleteUserModal = useCallback(() => {
    setDeleteUserModalVis((previousVis) => !previousVis);
  }, []);

  const onUserDeleted = useCallback(() => {
    if (toggle) {
      toggle();
    }
  }, [toggle]);

  const privacyPolicyModalBodies = {
    fr: <PrivacyPolicyModalBodyFr deleteAllUserData={() => setDeleteUserModalVis(true)} />,
    en: <PrivacyPolicyModalBodyEn deleteAllUserData={() => setDeleteUserModalVis(true)} />,
  };
  const supportedLanguages = Object.keys(privacyPolicyModalBodies);
  const privacyPolicyModalBody = supportedLanguages.includes(shortLanguage) ? (privacyPolicyModalBodies as any)[shortLanguage] as JSX.Element : privacyPolicyModalBodies.en;

  return (
    <>
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
      <DeleteUserModal isOpen={deleteUserModalVis} toggle={toggleDeleteUserModal} onUserDeleted={onUserDeleted} />
    </>
  );
};

export default PrivacyPolicyModal;
