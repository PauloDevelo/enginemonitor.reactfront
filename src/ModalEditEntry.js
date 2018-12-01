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
			name: '',
			UTCDate: new Date().toISOString().substr(0, 10),
			age: '',
			remarks: '',
			
			prevprops: { visible: false }
		}
		
		this.delete = this.delete.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setDefaultState = this.setDefaultState.bind(this);
	}
	
	setDefaultState(newProps) {
		if (newProps.name !== undefined){
			this.setState(function(prevState, props){
				return {
                    name: newProps.name,
                    UTCDate: newProps.UTCDate.toISOString().substr(0, 10),
                    age: newProps.age,
                    remarks: newProps.remarks,
					
					prevprops: { visible: newProps.visible }
				};
			});
		}
	}
	
	static getDerivedStateFromProps(nextProps, prevState){
		if(prevState.prevprops.visible === false && nextProps.visible === true){
			return {
				id: nextProps.entry.id,
				name: nextProps.entry.name,
				UTCDate: nextProps.entry.UTCDate.toISOString().substr(0, 10),
				age: nextProps.entry.age,
				remarks: nextProps.entry.remarks,
				prevprops: { visible: nextProps.visible}
			};
		}
		else if(prevState.prevprops.visible === true && nextProps.visible === false){
			return {
				prevprops: {visible: nextProps.visible}
			}
		}
		else{
			return null;
		}
	}

	handleSubmit(event) {
		var currentState = Object.assign({}, this.state);
        currentState.UTCDate = new Date(this.state.UTCDate);
        
		this.props.save(currentState);
		this.props.toggle();
	}
	
	delete(){
		this.props.delete(this.props.entry.id);
		this.props.toggle();
	}

	handleChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		
		this.setState(function(prevState, props){
			return { [name]: value }
		});
		
		if(this.state[name] === undefined){
			console.log('The property ' + name + ' is not defined in the state:');
			console.log(this.state);
		}
	}

    render() {
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
                    <MyForm submit={this.handleSubmit} id="createTaskForm">
                        <MyInput name="name" 	label={editentrymsg.name} 	    type="text" 	value={this.state.name} 	handleChange={this.handleChange} required/>
                        <MyInput name="UTCDate" label={editentrymsg.date}       type="date" 	value={this.state.UTCDate} 	handleChange={this.handleChange} required/>
                        <MyInput name="age" 	label={editentrymsg.engineAge} 	type="number" 	value={this.state.age} 		handleChange={this.handleChange} min={0} required/>
                        <MyInput name="remarks" label={editentrymsg.remarks}    type="textarea" value={this.state.remarks} 	handleChange={this.handleChange} required />
                    </MyForm>
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