import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import loginmsg from "./Login.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"

import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModaLogin = ({login, visible, className, data, toggleModalSignup}) => {
	const [loginErrors, setLoginErrors] = useState(undefined);

    const handleSubmit = async(data) => {
		try{
			await login(data);
			setLoginErrors(undefined);
		}
		catch(errors){
			if(errors instanceof HttpError){
                const newLoginErrors = errors.data;
                setLoginErrors(newLoginErrors);
			}
		}
	}
    
	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} className={className} fade={false}>
				<ModalHeader><FontAwesomeIcon icon={faSignInAlt} />{' '}<FormattedMessage {...loginmsg.modaltitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formLogin" initialData={data}>
						<MyInput name="email" 		label={loginmsg.email} 		type="email" 	required/>
						<MyInput name="password" 	label={loginmsg.password} 	type="password" required/>
                        <MyInput name="remember" 	label={loginmsg.remember} 	type="checkbox"/>
					</MyForm>}
					<Alerts errors={loginErrors}/>
				</ModalBody>
				<ModalFooter>
					<Button onClick={toggleModalSignup} color="success"><FormattedMessage {...loginmsg.signup} /></Button>
					<Button type="submit" form="formLogin" color="success"><FormattedMessage {...loginmsg.login} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModaLogin.propTypes = {
	visible: PropTypes.bool.isRequired,
	login: PropTypes.func.isRequired,
	className: PropTypes.string,
    data: PropTypes.object,
	toggleModalSignup: PropTypes.func.isRequired
};

export default ModaLogin;