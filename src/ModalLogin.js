import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import loginmsg from "./Login.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

import './transition.css';

const ModaLogin = ({login, visible, className, data, loginErrors}) => {
    const handleSubmit = (data) => {
		login(data);
    }
    
    let alerts = [];
    if(loginErrors){
        let keys = Object.keys(loginErrors);
        alerts = keys.map(key => {
            return(
                <Alert className="sm" key={key} color="danger">
                    <FormattedMessage {...loginmsg[key]}/> {' '} <FormattedMessage {...loginmsg[loginErrors[key]]}/>
                </Alert>)
        });
    }

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} className={className} fade={false}>
				<ModalHeader><FormattedMessage {...loginmsg.modaltitle} /></ModalHeader>
				<ModalBody>
				    {visible && <MyForm submit={handleSubmit} id="formLogin" initialData={data}>
						<MyInput name="email" 		label={loginmsg.email} 		type="email" 	required/>
						<MyInput name="password" 	label={loginmsg.password} 	type="password" required/>
                        <MyInput name="remember" 	label={loginmsg.remember} 	type="checkbox"/>
                    </MyForm>}
                    {alerts}
				</ModalBody>
				<ModalFooter>
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
    loginErrors: PropTypes.object
};

export default ModaLogin;