import React, { useState, Fragment, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import { useEditModal } from '../../hooks/EditModalHook';

import ModalPasswordReset from '../ModalPasswordReset/ModalPasswordReset'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import ActionButton from "../ActionButton/ActionButton"

import HttpError from '../../http/HttpError'

import userProxy from '../../services/UserProxy';

import { AuthInfo, UserModel } from '../../types/Types'

import '../../style/transition.css';

import jsonMessages from "./Login.messages.json";
const loginmsg = defineMessages(jsonMessages);

type Props = {
	onLoggedIn: (user:UserModel) => void, 
	visible: boolean, 
	className: string, 
	toggleModalSignup: () => void
}

enum LoginState {
    Started = 1,
	IsLoggingIn,
	NotVerified,
	WrongPassword,
    InError,
    LoggedIn,
}

type StateType = {
	state: LoginState,
	infoMsg?: string,
	errors?: any
}

const ModaLogin = ({onLoggedIn, visible, className, toggleModalSignup}: Props) => {
	const [user, setUser] = useState<AuthInfo>({ email: '', password: '', remember:false});	
	const [state, setState] = useState<StateType>({state: LoginState.Started});
	
	const resetPasswordModalHook = useEditModal({email: '', newPassword1: '', newPassword2: ''});

	useEffect(() => {
		setState({state: LoginState.Started});
	}, [resetPasswordModalHook.editModalVisibility])

	const sendVerificationEmail = async()=>{
		setState({state: LoginState.IsLoggingIn});
		try{
			await userProxy.sendVerificationEmail(user.email);
			setState({state: LoginState.Started, infoMsg: "emailSent"});
		}
		catch(errors){
			if(errors instanceof HttpError){
				setState({state: LoginState.InError, errors: errors.data});
			}
			else{
				setState({state: LoginState.InError, errors: errors.message});
			}
		}
	}

  const handleSubmit = async(newUser:AuthInfo) => {
		setState({state: LoginState.IsLoggingIn});
		setUser(newUser);

		try{
			const user = await userProxy.authenticate(newUser);
			setState({state: LoginState.LoggedIn});
			onLoggedIn(user);
		}
		catch(errors){
			if(errors instanceof HttpError){
				const newLoginErrors = errors.data;

				if (newLoginErrors.password === "invalid"){
					setState({state: LoginState.WrongPassword, errors: newLoginErrors });
				}
				else if(newLoginErrors.email === "needVerification"){
					setState({state: LoginState.NotVerified, errors: newLoginErrors });
				}
				else{
					setState({state: LoginState.InError, errors: newLoginErrors });
				}

				resetPasswordModalHook.setData({email: newUser.email, newPassword1: '', newPassword2: '' });
			}
			else{
				setState({state: LoginState.InError, errors: errors.message });
			}
		}
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
						{state.state === LoginState.IsLoggingIn && <Spinner size="sm" color="secondary" />}
						{state.infoMsg && <Alerts error={state.infoMsg} color="success"/>}
						{state.errors && <Alerts errors={state.errors}/>}
					</ModalBody>
					<ModalFooter>
						<Button onClick={toggleModalSignup} color="warning" className="d-block mx-auto"><FormattedMessage {...loginmsg.signup} /></Button>
						{state.state === LoginState.WrongPassword && <Button onClick={resetPasswordModalHook.toggleModal} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.resetPassword} /></Button>}
						{state.state === LoginState.NotVerified && <Button onClick={sendVerificationEmail} color="secondary" className="d-block mx-auto"><FormattedMessage {...loginmsg.sendVerification} /></Button>}
						<ActionButton type="submit" form="formLogin" color="success" className="d-block mx-auto" message={loginmsg.login} isActing={state.state === LoginState.IsLoggingIn} />
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