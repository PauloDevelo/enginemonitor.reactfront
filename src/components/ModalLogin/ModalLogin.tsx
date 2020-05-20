import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner,
} from 'reactstrap';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FormattedMessage, defineMessages } from 'react-intl';

import useEditModal from '../../hooks/EditModalHook';

import ModalPasswordReset from '../ModalPasswordReset/ModalPasswordReset';
import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';

import HttpError from '../../http/HttpError';

import userProxy from '../../services/UserProxy';

// eslint-disable-next-line no-unused-vars
import { AuthInfo } from '../../types/Types';

import './ModalLogin.css';
import '../../style/transition.css';

import jsonMessages from './Login.messages.json';

const loginmsg = defineMessages(jsonMessages);

type Props = {
visible: boolean,
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
  const [user, setUser] = useState<AuthInfo>({ email: '', password: '', remember: false });
  const [state, setState] = useState<StateType>({ state: LoginState.Started });

  const resetPasswordModalHook = useEditModal({ email: '', newPassword1: '', newPassword2: '' });

  useEffect(() => {
    setState({ state: LoginState.Started });
  }, [resetPasswordModalHook.editModalVisibility]);

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
    setState({ state: LoginState.IsLoggingIn });
    setUser(newUser);

    try {
      await userProxy.authenticate(newUser);
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
            <MyInput name="remember" label={loginmsg.remember} type="checkbox" />
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
          <h4><span><FormattedMessage {...loginmsg.or} /></span></h4>
          <GoogleLoginButton className="mx-auto" />
        </ModalFooter>
      </Modal>
      <ModalPasswordReset toggle={resetPasswordModalHook.toggleModal} visible={resetPasswordModalHook.editModalVisibility} data={resetPasswordModalHook.data} className="modal-dialog-centered" />
    </>
  );
};

export default ModalLogin;
