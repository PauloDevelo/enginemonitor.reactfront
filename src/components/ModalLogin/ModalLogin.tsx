/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner,
} from 'reactstrap';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FormattedMessage, defineMessages } from 'react-intl';

import useEditModal from '../../hooks/EditModalHook';

import PrivacyPolicyModal from '../PrivacyPolicyModal/PrivacyPolicyModal';
import ModalPasswordReset from '../ModalPasswordReset/ModalPasswordReset';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import HorizontalSeparationWithTitle from '../HorizontalSeparationWithTitle/HorizontalSeparationWithTitle';

import HttpError from '../../http/HttpError';

import userProxy from '../../services/UserProxy';
import storageService from '../../services/StorageService';

// eslint-disable-next-line no-unused-vars
import { AuthInfo } from '../../types/Types';

import './ModalLogin.css';
import '../../style/transition.css';

import jsonMessages from './Login.messages.json';

const loginmsg = defineMessages(jsonMessages);

type Props = {
visible: boolean,
// eslint-disable-next-line react/require-default-props
className?: string,
toggleModalSignup: () => void
}

enum LoginState {
// eslint-disable-next-line no-unused-vars
Started = 1,
// eslint-disable-next-line no-unused-vars
IsLoggingIn,
// eslint-disable-next-line no-unused-vars
NotVerified,
// eslint-disable-next-line no-unused-vars
WrongPassword,
// eslint-disable-next-line no-unused-vars
InError,
// eslint-disable-next-line no-unused-vars
LoggedIn,
}

type StateType = {
state: LoginState,
infoMsg?: string,
errors?: any
}

const ModalLogin = ({
  visible, className, toggleModalSignup,
}: Props) => {
  const [rememberMe, setRememberMe] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<AuthInfo>({ email: '', password: '', remember: false });
  const [state, setState] = useState<StateType>({ state: LoginState.Started });

  const resetPasswordModalHook = useEditModal({ email: '', newPassword1: '', newPassword2: '' });

  useEffect(() => {
    storageService.tryGetGlobalItem<boolean>('rememberMe', false)
      .then((rememberMeValue) => {
        setRememberMe(rememberMeValue);
      });
  }, []);

  useEffect(() => {
    setState({ state: LoginState.Started });
  }, [resetPasswordModalHook.editModalVisibility]);

  useEffect(() => {
    if (rememberMe !== undefined) {
      setUser((previousUser) => ({ ...previousUser, remember: rememberMe! }));
      storageService.setGlobalItem('rememberMe', rememberMe);
    }
  }, [rememberMe]);

  const [privacyPolicyVisibility, setPrivacyPolicyVisibility] = useState(false);

  const togglePrivacyPolicyContent = useCallback((event? : React.MouseEvent) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    setPrivacyPolicyVisibility((prevPrivacyPolicyVisibility) => !prevPrivacyPolicyVisibility);
  }, []);

  const sendVerificationEmail = async () => {
    setState({ state: LoginState.IsLoggingIn });
    try {
      await userProxy.sendVerificationEmail(user.email);
      setState({ state: LoginState.Started, infoMsg: 'emailSent' });
    } catch (errors) {
      if (errors instanceof HttpError) {
        setState({ state: LoginState.InError, errors: errors.data });
      } else {
        setState({ state: LoginState.InError, errors: errors.message });
      }
    }
  };

  const handleSubmit = async (newUser:AuthInfo) => {
    const currentUser = { ...newUser };
    if (rememberMe !== undefined) {
      currentUser.remember = rememberMe;
    }

    setState({ state: LoginState.IsLoggingIn });
    setUser(currentUser);

    try {
      await userProxy.authenticate(currentUser);
      setState({ state: LoginState.Started });
    } catch (errors) {
      if (errors instanceof HttpError) {
        const newLoginErrors = errors.data;

        if (newLoginErrors.password === 'invalid') {
          setState({ state: LoginState.WrongPassword, errors: newLoginErrors });
        } else if (newLoginErrors.email === 'needVerification') {
          setState({ state: LoginState.NotVerified, errors: newLoginErrors });
        } else {
          setState({ state: LoginState.InError, errors: newLoginErrors });
        }

        resetPasswordModalHook.setData({ email: newUser.email, newPassword1: '', newPassword2: '' });
      } else {
        setState({ state: LoginState.InError, errors: errors.message });
      }
    }
  };

  const privacyPolicyAcceptanceLabel = {
    ...loginmsg.privacyPolicyAcceptance,
    values: {
      privatePolicyLink: <a href="privacypolicy" onClick={togglePrivacyPolicyContent}><FormattedMessage {...loginmsg.privacyPolicy} /></a>,
    },
  };

  return (
    <>
      <Modal isOpen={visible && state.state !== LoginState.LoggedIn} className={className} fade>
        <ModalHeader>
          <FontAwesomeIcon icon={faSignInAlt} />
          {' '}
          <FormattedMessage {...loginmsg.modaltitle} />
        </ModalHeader>
        <ModalBody>
          {visible && (
          <MyForm submit={handleSubmit} id="formLogin" initialData={user}>
            <MyInput name="email" label={loginmsg.email} type="email" required />
            <MyInput name="password" label={loginmsg.password} type="password" required />
          </MyForm>
          )}
          {state.state === LoginState.IsLoggingIn && <Spinner size="sm" color="secondary" />}
          {state.infoMsg && <Alerts error={state.infoMsg} color="success" />}
          {state.errors && <Alerts errors={state.errors} />}
        </ModalBody>
        <ModalFooter className="without-horizontal-bar">
          <Button onClick={toggleModalSignup} color="warning" className="d-block mx-auto"><FormattedMessage {...loginmsg.signup} /></Button>
          {state.state === LoginState.WrongPassword && <Button onClick={resetPasswordModalHook.toggleModal} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.resetPassword} /></Button>}
          {state.state === LoginState.NotVerified && <Button onClick={sendVerificationEmail} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.sendVerification} /></Button>}
          <ActionButton type="submit" form="formLogin" color="success" className="d-block mx-auto" message={loginmsg.login} isActing={state.state === LoginState.IsLoggingIn} />
        </ModalFooter>
        <ModalFooter className="without-horizontal-bar">
          <HorizontalSeparationWithTitle title={loginmsg.or} />
          <GoogleLoginButton className="mx-auto" />
        </ModalFooter>
        <ModalFooter>
          <MyInput name="remember" label={loginmsg.remember} type="checkbox" onChanged={setRememberMe} checked={rememberMe} />
        </ModalFooter>
        <ModalFooter className="without-horizontal-bar">
          <small><FormattedMessage {...privacyPolicyAcceptanceLabel} /></small>
        </ModalFooter>
      </Modal>
      <ModalPasswordReset toggle={resetPasswordModalHook.toggleModal} visible={resetPasswordModalHook.editModalVisibility} data={resetPasswordModalHook.data} className="modal-dialog-centered" />
      <PrivacyPolicyModal visible={privacyPolicyVisibility} toggle={togglePrivacyPolicyContent} className="modal-dialog-centered" />
    </>
  );
};

export default ModalLogin;
