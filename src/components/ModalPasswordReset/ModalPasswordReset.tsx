/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner,
} from 'reactstrap';
import { faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage, defineMessages } from 'react-intl';

import MyForm from '../Form/MyForm';
import MyInput from '../Form/MyInput';
import Alerts from '../Alerts/Alerts';
import ActionButton from '../ActionButton/ActionButton';

import userProxy from '../../services/UserProxy';
import HttpError from '../../http/HttpError';

import '../../style/transition.css';

import jsonMessages from './PasswordReset.messages.json';

const changePasswordMsg = defineMessages(jsonMessages);

type NewPassword = {
email:string,
newPassword1?:string,
newPassword2?:string
};

type Props = {
visible: boolean,
// eslint-disable-next-line react/require-default-props
className?: string,
toggle: () => void,
data: NewPassword
};

enum ResetPasswordState {
// eslint-disable-next-line no-unused-vars
Started = 1,
// eslint-disable-next-line no-unused-vars
IsChanging,
// eslint-disable-next-line no-unused-vars
InError,
// eslint-disable-next-line no-unused-vars
Succeed,
}

type StateType = {
state: ResetPasswordState,
infoMsg?: string,
resetPasswordErrors?: any
}

const ModalPasswordReset = ({
  visible, className, toggle, data,
}: Props) => {
  const [state, setState] = useState<StateType>({ state: ResetPasswordState.Started });

  useEffect(() => {
    setState({ state: ResetPasswordState.Started });
  }, [visible]);

  const cancel = () => {
    toggle();
  };

  const handleSubmit = async (newData: NewPassword) => {
    if (state.state === ResetPasswordState.Succeed) {
      toggle();
    } else {
      setState({ state: ResetPasswordState.IsChanging });

      try {
        if (newData.newPassword1 !== undefined && newData.newPassword1 === newData.newPassword2) {
          await userProxy.resetPassword(newData.email, newData.newPassword1);
          setState({ state: ResetPasswordState.Succeed, infoMsg: 'confirmPasswordChange' });
        } else {
          setState({ state: ResetPasswordState.InError, resetPasswordErrors: { password: 'passwordsHaveToBeIdentical' } });
        }
      } catch (errors) {
        if (errors instanceof HttpError) {
          const newResetPasswordErrors = errors.data;
          setState({ state: ResetPasswordState.InError, resetPasswordErrors: newResetPasswordErrors });
        } else {
          setState({ state: ResetPasswordState.InError });
        }
      }
    }
  };

  const submitButtonLabel = state.state === ResetPasswordState.Succeed ? changePasswordMsg.close : changePasswordMsg.changePassword;

  return (
    <Modal isOpen={visible} toggle={cancel} className={className} fade>
      <ModalHeader toggle={cancel}>
        <FontAwesomeIcon icon={faUnlockAlt} />
        {' '}
        <FormattedMessage {...changePasswordMsg.modalResetPasswordTitle} />
      </ModalHeader>
      <ModalBody>
        {visible && (
        <MyForm submit={handleSubmit} id="formChangePassword" initialData={data}>
          <MyInput name="email" label={changePasswordMsg.email} type="email" required readOnly />
          <MyInput name="newPassword1" label={changePasswordMsg.newPassword} type="password" required />
          <MyInput name="newPassword2" label={changePasswordMsg.retypeNewPassword} type="password" required />
        </MyForm>
        )}
        {state.state === ResetPasswordState.InError && <Alerts errors={state.resetPasswordErrors} />}
        {state.state === ResetPasswordState.IsChanging && <Alerts error="changingPassword" color="success"><Spinner size="sm" color="secondary" /></Alerts>}
        {state.state === ResetPasswordState.Succeed && <Alerts error={state.infoMsg} color="success" />}
      </ModalBody>
      <ModalFooter>
        <ActionButton type="submit" form="formChangePassword" color="success" message={submitButtonLabel} isActing={state.state === ResetPasswordState.IsChanging} />
        {state.state !== ResetPasswordState.Succeed && <Button color="secondary" onClick={cancel}><FormattedMessage {...changePasswordMsg.cancel} /></Button>}
      </ModalFooter>
    </Modal>
  );
};

export default ModalPasswordReset;
