import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import engineinfomsg from "./EngineInfo.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEngineInfo extends React.Component {
	constructor(props) {
		super(props);
			
		this.state = {
			prevprops: props
		}
	}
	
	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible !== nextProps.visible){
			return { prevprops: nextProps };
		}
		else{
			return null;
		}
	}
	
	handleSubmit = (data) => {
    	this.props.save(data);
		this.props.toggle();
	}
	  
  	render() {
    	return (
		<Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
			<ModalHeader toggle={this.props.toggle}><FormattedMessage {...engineinfomsg.modalTitle} /></ModalHeader>
			<ModalBody>
			{this.props.visible && <MyForm submit={this.handleSubmit} id="formEngineInfo" initialData={this.props.data}>
					<MyInput name="brand" 			label={engineinfomsg.brand} 			type="text" 	required/>
					<MyInput name="model" 			label={engineinfomsg.model} 			type="text" 	required/>
					<MyInput name="installation" 	label={engineinfomsg.installDateLabel} 	type="date" 	required/>
					<MyInput name="age" 			label={engineinfomsg.engineAge} 		type="number" 	required min={0} />
				</MyForm>}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" form="formEngineInfo" color="success"><FormattedMessage {...engineinfomsg.save} /></Button>
				<Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...engineinfomsg.cancel} /></Button>
			</ModalFooter>
		</Modal>
    );
  }
}

ModalEngineInfo.propTypes = {
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	className: PropTypes.string,
	data: PropTypes.object
};

export default ModalEngineInfo;