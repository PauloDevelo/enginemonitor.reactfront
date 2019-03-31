import React, { useState, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Row, Col, Spinner } from 'reactstrap';
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { useEditModal } from '../../hooks/EditModalHook';

import loginmsg from "./Login.messages";

import ModalPasswordReset from '../ModalPasswordReset/ModalPasswordReset'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"

import HttpError from '../../http/HttpError'

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import '../../style/transition.css';

const ModaLogin = ({onLoggedIn, visible, className, toggleModalSignup}) => {
	const [user, setUser] = useState({ email: '', password: '', remember:false});
	
	const [resetPassword, setResetPassword] = useState(false);
	const [sendVerification, setSendVerification] = useState(false);
	
	const [loginErrors, setLoginErrors] = useState(undefined);
	const [infoMsg, setInfoMsg] = useState(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	
	const resetPasswordModalHook = useEditModal({email: '', newPassword1: '', newPassword2: ''});

	const sendVerificationEmail = async()=>{
		setIsLoading(true);
		setIsError(false);
		setInfoMsg(undefined);

		try{
			await EquipmentMonitorService.sendVerificationEmail(user);
			setLoginErrors(undefined);
			setInfoMsg("emailSent");
		}
		catch(errors){
			if(errors instanceof HttpError){
				setIsError(true);
				setLoginErrors(errors.data);
			}
		}

		setIsLoading(false);
	}

  const handleSubmit = async(newUser) => {
		setIsLoading(true);
		setIsError(false);
		setInfoMsg(undefined);
		setUser(newUser);

		try{
			const user = await EquipmentMonitorService.authenticate(newUser);
			onLoggedIn(user);
			setLoginErrors(undefined);
			setResetPassword(false);
			setSendVerification(false);
		}
		catch(errors){
			if(errors instanceof HttpError){
				setIsError(true);
        const newLoginErrors = errors.data;
				setLoginErrors(newLoginErrors);

				setResetPassword(newLoginErrors.password === "invalid");
				setSendVerification(newLoginErrors.email === "needVerification");

				resetPasswordModalHook.setData({email: newUser.email, newPassword1: '', newPassword2: ''})
			}
		}

		setIsLoading(false);
	}
    
	return (
		<Fragment>
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} className={className} fade={false}>
					<ModalHeader><FontAwesomeIcon icon={faSignInAlt} />{' '}<FormattedMessage {...loginmsg.modaltitle} /></ModalHeader>
					<ModalBody>
						{visible && <MyForm submit={handleSubmit} id="formLogin" initialData={user}>
							<MyInput name="email" 		label={loginmsg.email} 		type="email" 	required/>
							<MyInput name="password" 	label={loginmsg.password} 	type="password" required/>
							<MyInput name="remember" 	label={loginmsg.remember} 	type="checkbox"/>
						</MyForm>}
						{isLoading && <Spinner size="sm" color="secondary" />}
						{infoMsg && <Alerts error={infoMsg} color="success"/>}
						{isError && <Alerts errors={loginErrors}/>}
					</ModalBody>
					<ModalFooter>
						<Container>
							<Row>
								<Col sm="3"><Button onClick={toggleModalSignup} color="warning" className="d-block mx-auto"><FormattedMessage {...loginmsg.signup} /></Button></Col>
								<Col sm="6">
									{resetPassword && <Button onClick={resetPasswordModalHook.toggleModal} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.resetPassword} /></Button>}
									{sendVerification && <Button onClick={sendVerificationEmail} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.sendVerification} /></Button>}
								</Col>
								<Col sm="3"><Button type="submit" form="formLogin" color="success" className="d-block mx-auto"><FormattedMessage {...loginmsg.login} /></Button></Col>
							</Row>
						</Container>
					</ModalFooter>
				</Modal>
			</CSSTransition>
			<ModalPasswordReset toggle={resetPasswordModalHook.toggleModal} visible={resetPasswordModalHook.editModalVisibility} data={resetPasswordModalHook.data} className='modal-dialog-centered'/>
		</Fragment>
	);
}

ModaLogin.propTypes = {
	visible: PropTypes.bool.isRequired,
	onLoggedIn: PropTypes.func.isRequired,
	className: PropTypes.string,
	toggleModalSignup: PropTypes.func.isRequired
};

export default ModaLogin;