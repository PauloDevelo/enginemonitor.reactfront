// eslint-disable-next-line no-use-before-define
import React, { useState, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';

import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';
import PrivacyPolicyModal from '../PrivacyPolicyModal/PrivacyPolicyModal';

import userProxy from '../../services/UserProxy';
import HttpError from '../../http/HttpError';

// eslint-disable-next-line no-unused-vars
import { UserModel } from '../../types/Types';
import { createDefaultUser } from '../../helpers/UserHelper';

import jsonMessages from './ModalSignup.messages.json';

import '../../style/transition.css';

const loginMsg = defineMessages(jsonMessages);

type Props = {
visible: boolean,
// eslint-disable-next-line react/require-default-props
className?: string,
toggle: () => void
}

const ModalSignup = ({ visible, className, toggle }: Props) => {
  const data:UserModel = createDefaultUser();
  const [privacyPolicyVisibility, setPrivacyPolicyVisibility] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | undefined>(undefined);
  const [signupErrors, setSignupErrors] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const togglePrivacyPolicyContent = useCallback((event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    setPrivacyPolicyVisibility((prevPrivacyPolicyVisibility) => !prevPrivacyPolicyVisibility);
  }, []);

  const cancel = useCallback(() => {
    setSignupErrors(undefined);
    setInfoMsg(undefined);
    toggle();
  }, [toggle]);

  const handleSubmit = useCallback(async (newUser: UserModel) => {
    setIsError(false);
    setIsLoading(true);
    setInfoMsg(undefined);

    try {
      await userProxy.signup(newUser);
      setSignupErrors(undefined);
      setInfoMsg('emailSent');
    } catch (errors) {
      setIsError(true);

      if (errors instanceof HttpError) {
        const newSignupErrors = errors.data;
        setSignupErrors(newSignupErrors);
      }
    }
    setIsLoading(false);
  }, []);

  const privacyPolicyAcceptanceLabel = {
    ...loginMsg.privacyPolicyAcceptance,
    values: {
      privatePolicyLink: <a href="privacypolicy" onClick={togglePrivacyPolicyContent}><FormattedMessage {...loginMsg.privacyPolicy} /></a>,
    },
  };

  return (
    <>
      <Modal isOpen={visible} toggle={cancel} className={className} fade>
        <ModalHeader toggle={cancel}>
          <FontAwesomeIcon icon={faUserPlus} />
          {' '}
          <FormattedMessage {...loginMsg.modalSignupTitle} />
        </ModalHeader>
        <ModalBody>
          {visible && (
          <MyForm submit={handleSubmit} id="formSignup" initialData={data}>
            <MyInput name="name" label={loginMsg.name} type="text" required />
            <MyInput name="firstname" label={loginMsg.firstname} type="text" required />
            <MyInput name="email" label={loginMsg.email} type="email" required />
            <MyInput name="password" label={loginMsg.password} type="password" required />
            <MyInput name="privacyPolicyAccepted" label={privacyPolicyAcceptanceLabel} type="checkbox" required />
          </MyForm>
          )}
          {isError && <Alerts errors={signupErrors} />}
          {isLoading && <Alerts error="creatingUser" color="success" />}
          {infoMsg && <Alerts error={infoMsg} color="success" />}
        </ModalBody>
        <ModalFooter>
          <ActionButton type="submit" form="formSignup" color="success" message={loginMsg.signup} isActing={isLoading} />
          <Button color="secondary" onClick={cancel}><FormattedMessage {...loginMsg.cancel} /></Button>
        </ModalFooter>
      </Modal>
      <PrivacyPolicyModal visible={privacyPolicyVisibility} toggle={togglePrivacyPolicyContent} className="modal-dialog-centered" />
    </>
  );
};

export default ModalSignup;
