import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage, Messages, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import uuidv1  from 'uuid/v1';

import jsonMessages from "../ModalLogin/Login.messages.json";
const loginMsg: Messages = defineMessages(jsonMessages);

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"
import ActionButton from "../ActionButton/ActionButton";

import {userProxy} from '../../services/EquipmentMonitorServiceProxy';
import HttpError from '../../http/HttpError'

import '../../style/transition.css';
import { UserModel } from "../../types/Types";

type Props = {
	visible: boolean, 
	className: string, 
	toggle: () => void
}

const ModalSignup = ({visible, className, toggle}: Props) => {
	const uid = uuidv1(); 
	const data:UserModel = { _uiId:uid, firstname:'', name:'', email: '', password: ''};
 	const [infoMsg, setInfoMsg] = useState<string | undefined>(undefined);
	const [signupErrors, setSignupErrors] = useState<any>(undefined);
	const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const cancel = () => {
		setSignupErrors(undefined);
		setInfoMsg(undefined);
		toggle();
    }

    const handleSubmit = async(newUser: UserModel) => {
		setIsError(false);
		setIsLoading(true);
		setInfoMsg(undefined);
	  
        try{
            await userProxy.signup(newUser);
			setSignupErrors(undefined);
			setInfoMsg("emailSent")
		}
		catch(errors){
			setIsError(true);

			if(errors instanceof HttpError){
                const newSignupErrors = errors.data;
                setSignupErrors(newSignupErrors);
			}
		}
		setIsLoading(false);
    }

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faUserPlus} />{' '}<FormattedMessage {...loginMsg.modalSignupTitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formSignup" initialData={data}>
                        <MyInput name="name" 		label={loginMsg.name} 		type="text"     required/>
                        <MyInput name="firstname" 	label={loginMsg.firstname} 	type="text" 	required/>
						<MyInput name="email" 		label={loginMsg.email} 		type="email" 	required/>
						<MyInput name="password" 	label={loginMsg.password} 	type="password" required/>
                    </MyForm>}
					{isError && <Alerts errors={ signupErrors } />}
					{isLoading && <Alerts error={"creatingUser"} color="success"/>}
					{infoMsg && <Alerts error={infoMsg} color="success"/>}
				</ModalBody>
				<ModalFooter>
					<ActionButton type="submit" form="formSignup" color="success" message={loginMsg.signup} isActing={isLoading} />
                    <Button color="secondary" onClick={cancel}><FormattedMessage {...loginMsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalSignup.propTypes = {
    toggle: PropTypes.func.isRequired,
	visible: PropTypes.bool.isRequired,
	className: PropTypes.string
};

export default ModalSignup;