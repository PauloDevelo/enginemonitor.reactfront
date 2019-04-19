import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import changePasswordMsg from "./PasswordReset.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

type NewPassword = {
	email:string, 
	newPassword1?:string, 
	newPassword2?:string
};

type Props = {
	visible: boolean, 
	className: string, 
	toggle: () => void, 
	data: NewPassword
};

enum ResetPasswordState {
    Started = 1,
    IsChanging,
    InError,
    Succeed,
}

type StateType = {
	state: ResetPasswordState,
	infoMsg?: string,
	resetPasswordErrors?: any
}

const ModalPasswordReset = ({visible, className, toggle, data}: Props) => {
	const [state, setState] = useState<StateType>({state: ResetPasswordState.Started});

	useEffect(() => {
		setState({state: ResetPasswordState.Started});
	}, [visible]);

    const cancel = () => {
		toggle();
	}

    const handleSubmit = async(data: NewPassword) => {
		if(state.state === ResetPasswordState.Succeed){
			toggle();
		}
		else{
			setState({state: ResetPasswordState.IsChanging});

			try{
				if(data.newPassword1 !== undefined && data.newPassword1 === data.newPassword2){
					await EquipmentMonitorService.resetPassword(data.email, data.newPassword1);
					setState({state: ResetPasswordState.Succeed, infoMsg: "confirmPasswordChange"});
				}
				else{
					setState({state: ResetPasswordState.InError, resetPasswordErrors: { password: "passwordsHaveToBeIdentical"}});
				}
			}
			catch(errors){
				if(errors instanceof HttpError){
					const newResetPasswordErrors = errors.data;
					setState({state: ResetPasswordState.InError, resetPasswordErrors: newResetPasswordErrors});
				}
				else{
					setState({state: ResetPasswordState.InError});
				}
			}
		}
	}
	
	let submitButtonLabel = state.state === ResetPasswordState.Succeed ? changePasswordMsg.close : changePasswordMsg.changePassword;

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faUnlockAlt} />{' '}<FormattedMessage {...changePasswordMsg.modalResetPasswordTitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formChangePassword" initialData={data}>
                        <MyInput name="email" 			label={changePasswordMsg.email} 			type="email"     	required={true} readonly="true" />
                        <MyInput name="newPassword1" 	label={changePasswordMsg.newPassword} 		type="password" 	required/>
						<MyInput name="newPassword2" 	label={changePasswordMsg.retypeNewPassword} type="password" 	required/>
                    </MyForm>}
					{state.state === ResetPasswordState.InError && <Alerts errors={ state.resetPasswordErrors } />}
					{state.state === ResetPasswordState.IsChanging && <Alerts error={"changingPassword"} color="success"><Spinner size="sm" color="secondary" /></Alerts>}
					{state.state === ResetPasswordState.Succeed && <Alerts error={state.infoMsg} color="success"/>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formChangePassword" color="success"><FormattedMessage {...submitButtonLabel} /></Button>
                    {state.state !== ResetPasswordState.Succeed && <Button color="secondary" onClick={cancel}><FormattedMessage {...changePasswordMsg.cancel} /></Button>}
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalPasswordReset.propTypes = {
    toggle: PropTypes.func.isRequired,
	visible: PropTypes.bool.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalPasswordReset;