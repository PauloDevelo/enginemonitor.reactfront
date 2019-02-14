import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import loginmsg from "../ModalLogin/Login.messages";

import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';
import HttpError from '../../http/HttpError'

import '../../style/transition.css';

const ModaSignup = ({visible, className, toggle}) => {
	const data = { firstname:'', name:'', email: '', password: ''};
    const [signupErrors, setSignupErrors] = useState(undefined);

    const cancel = () => {
        setSignupErrors(undefined);
		toggle();
    }

    const handleSubmit = async(newuser) => {
        try{
            await EquipmentMonitorService.signup(newuser);
            setSignupErrors(undefined);
			toggle();
		}
		catch(errors){
			if(errors instanceof HttpError){
                const newSignupErrors = errors.data;
                setSignupErrors(newSignupErrors);
			}
		}
    }

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={cancel} className={className} fade={false}>
				<ModalHeader toggle={cancel}><FontAwesomeIcon icon={faUserPlus} />{' '}<FormattedMessage {...loginmsg.modalSignupTitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formSignup" initialData={data}>
                        <MyInput name="name" 		label={loginmsg.name} 		type="text"     required/>
                        <MyInput name="firstname" 	label={loginmsg.firstname} 	type="text" 	required/>
						<MyInput name="email" 		label={loginmsg.email} 		type="email" 	required/>
						<MyInput name="password" 	label={loginmsg.password} 	type="password" required/>
                    </MyForm>}
                    <Alerts errors={signupErrors} />
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formSignup" color="success"><FormattedMessage {...loginmsg.signup} /></Button>
                    <Button color="secondary" onClick={cancel}><FormattedMessage {...loginmsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModaSignup.propTypes = {
    toggle: PropTypes.func.isRequired,
	visible: PropTypes.bool.isRequired,
	className: PropTypes.string
};

export default ModaSignup;