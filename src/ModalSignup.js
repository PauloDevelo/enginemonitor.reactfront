import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import loginmsg from "./Login.messages";

import MyForm from "./MyForm";
import MyInput from "./MyInput";

import './transition.css';

const ModaSignup = ({signup, visible, className, data, signupErrors, toggle}) => {
    const handleSubmit = (data) => {
		signup(data);
    }
    
    let alerts = [];
    if(signupErrors){
        let keys = Object.keys(signupErrors);
        alerts = keys.map(key => {
            return(
                <Alert className="sm" key={key} color="danger">
                    <FormattedMessage {...loginmsg[key]}/> {' '} <FormattedMessage {...loginmsg[signupErrors[key]]}/>
                </Alert>)
        });
    }

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
				<ModalHeader toggle={toggle}><FontAwesomeIcon icon={faUserPlus} />{' '}<FormattedMessage {...loginmsg.modalSignupTitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formSignup" initialData={data}>
                        <MyInput name="name" 		label={loginmsg.name} 		type="text"     required/>
                        <MyInput name="firstname" 	label={loginmsg.firstname} 	type="text" 	required/>
						<MyInput name="email" 		label={loginmsg.email} 		type="email" 	required/>
						<MyInput name="password" 	label={loginmsg.password} 	type="password" required/>
                    </MyForm>}
                    {alerts}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formSignup" color="success"><FormattedMessage {...loginmsg.signup} /></Button>
                    <Button color="secondary" onClick={toggle}><FormattedMessage {...loginmsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModaSignup.propTypes = {
    toggle: PropTypes.func.isRequired,
	visible: PropTypes.bool.isRequired,
	signup: PropTypes.func.isRequired,
	className: PropTypes.string,
    data: PropTypes.object,
    signupErrors: PropTypes.object
};

export default ModaSignup;