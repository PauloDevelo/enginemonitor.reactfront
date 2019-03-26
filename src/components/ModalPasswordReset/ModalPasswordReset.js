import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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

const ModalPasswordReset = ({visible, className, toggle, data}) => {
	const [infoMsg, setInfoMsg] = useState(undefined);
	const [resetPasswordErrors, setResetPasswordErrors] = useState(undefined);
	const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const cancel = () => {
		setResetPasswordErrors(undefined);
		setInfoMsg(undefined);
		toggle();
    }

    const handleSubmit = async(data) => {
		setIsError(false);
		setIsLoading(true);
		setInfoMsg(undefined);
	  
        try{
			if(data.newPassword1 === data.newPassword2){
				await EquipmentMonitorService.resetPassword(data.email, data.newPassword1);
				setResetPasswordErrors(undefined);
				setInfoMsg("confirmPasswordChange");
			}
			else{
				setIsError(true);
				setResetPasswordErrors("passwordsHaveToBeIdentical");
			}
            
		}
		catch(errors){
			setIsError(true);

			if(errors instanceof HttpError){
                const newResetPasswordErrors = errors.data;
                setResetPasswordErrors(newResetPasswordErrors);
			}
		}
		setIsLoading(false);
    }

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faUnlockAlt} />{' '}<FormattedMessage {...changePasswordMsg.modalResetPasswordTitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formChangePassword" initialData={data}>
                        <MyInput name="email" 			label={changePasswordMsg.email} 			type="email"     	required="true" readonly="true" />
                        <MyInput name="newPassword1" 	label={changePasswordMsg.newPassword} 		type="password" 	required/>
						<MyInput name="newPassword2" 	label={changePasswordMsg.retypeNewPassword} type="password" 	required/>
                    </MyForm>}
					{isError && <Alerts errors={ resetPasswordErrors } />}
					{isLoading && <Alerts errors={"changingPassword"} color="success"/>}
					{infoMsg && <Alerts errors={infoMsg} color="success"/>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formChangePassword" color="success"><FormattedMessage {...changePasswordMsg.changePassword} /></Button>
                    <Button color="secondary" onClick={cancel}><FormattedMessage {...changePasswordMsg.cancel} /></Button>
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