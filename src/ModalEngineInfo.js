import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

import './transition.css';

const ModalEngineInfo = ({saveEngineInfo, visible, toggle, className, data}) => {
	const handleSubmit = (data) => {
		saveEngineInfo(data);
		toggle();
	}

	return (
		<CSSTransition in={visible} timeout={300} classNames="modal">
			<Modal isOpen={visible} toggle={toggle} className={className} fade={false}>
				<ModalHeader toggle={toggle}><FormattedMessage {...engineinfomsg.modalTitle} /></ModalHeader>
				<ModalBody>
				{visible && <MyForm submit={handleSubmit} id="formEngineInfo" initialData={data}>
						<MyInput name="brand" 			label={engineinfomsg.brand} 			type="text" 	required/>
						<MyInput name="model" 			label={engineinfomsg.model} 			type="text" 	required/>
						<MyInput name="installation" 	label={engineinfomsg.installDateLabel} 	type="date" 	required/>
						<MyInput name="age" 			label={engineinfomsg.engineAge} 		type="number" 	required min={0} />
					</MyForm>}
				</ModalBody>
				<ModalFooter>
					<Button type="submit" form="formEngineInfo" color="success"><FormattedMessage {...engineinfomsg.save} /></Button>
					<Button color="secondary" onClick={toggle}><FormattedMessage {...engineinfomsg.cancel} /></Button>
				</ModalFooter>
			</Modal>
		</CSSTransition>
	);
}

ModalEngineInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	saveEngineInfo: PropTypes.func.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalEngineInfo;