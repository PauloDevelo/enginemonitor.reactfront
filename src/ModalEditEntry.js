import React from 'react';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { 
	FormattedMessage,
} from 'react-intl';

import PropTypes from 'prop-types';

import editentrymsg from "./ModalEditEntry.messages";

import MyForm from "./MyForm"
import MyInput from "./MyInput"

class ModalEditEntry extends React.Component {
	constructor(props) {
		super(props);
			
		this.state = {
			prevprops: { visible: false }
		}
	}
	
	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible !== nextProps.visible){
			return {
				prevprops: { visible: nextProps.visible}
			};
		}
		else{
			return null;
		}
	}

	handleSubmit = (formData) => {
		this.props.save(formData);
		this.props.toggle();
	}
	
	delete = () => {
		this.props.delete(this.props.entry.id);
		this.props.toggle();
	}

    render = () => {
        var title = undefined;
        if (this.props.entry.id === undefined){
            title = <FormattedMessage {...editentrymsg.modalAckTitle} />
        }
        else{
            title = <FormattedMessage {...editentrymsg.modalEditEntryTitle} />
        }

        return (
            <Modal isOpen={this.props.visible} toggle={this.props.toggle} className={this.props.className}>
                <ModalHeader toggle={this.props.toggle}>{title}</ModalHeader>
                <ModalBody>
                    {this.props.visible && 
					<MyForm id="createTaskForm" 
						submit={this.handleSubmit} 
						initialData={this.props.entry}>
                        <MyInput name="name" 	label={editentrymsg.name} 	    type="text" 	required/>
                        <MyInput name="UTCDate" label={editentrymsg.date}       type="date" 	required/>
                        <MyInput name="age" 	label={editentrymsg.engineAge} 	type="number" 	min={0} required/>
                        <MyInput name="remarks" label={editentrymsg.remarks}    type="textarea" required />
                    </MyForm>}
                </ModalBody>
                <ModalFooter>
                    <Button type="submit" form="createTaskForm" color="success"><FormattedMessage {...editentrymsg.save} /></Button>
                    <Button color="secondary" onClick={this.props.toggle}><FormattedMessage {...editentrymsg.cancel} /></Button>
                    {this.props.entry.id && <Button color="danger" onClick={this.delete}><FormattedMessage {...editentrymsg.delete} /></Button>}
                </ModalFooter>
            </Modal>
        );
    }
}

ModalEditEntry.propTypes = {
	entry: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired,
	delete: PropTypes.func.isRequired,
	className: PropTypes.string
};

export default ModalEditEntry;