import React, { Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { faEdit, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSTransition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import EquipmentMonitorService from '../../services/EquipmentMonitorServiceProxy';

import { useEditModalLogic } from '../../hooks/EditModalLogicHook';

import equipmentInfoMsg from "../EquipmentInfo/EquipmentInfo.messages";

import ModalYesNoConfirmation from '../ModalYesNoConfirmation/ModalYesNoConfirmation'
import MyForm from "../Form/MyForm"
import MyInput from "../Form/MyInput"
import Alerts from "../Alerts/Alerts"

import '../../style/transition.css';
import { Equipment } from '../../types/Types';

type Props = {
	equipment: Equipment,
	onEquipmentInfoSaved: (equipment: Equipment) => void,
	onEquipmentDeleted: (equipment: Equipment) => void,
	visible: boolean,
	toggle: () => void,
	className: string
}

const ModalEquipmentInfo = ({equipment, onEquipmentInfoSaved, onEquipmentDeleted, visible, toggle, className}: Props) => {
	const equipmentId = equipment === undefined ? undefined : equipment._id;
	const modalLogic = useEditModalLogic(toggle, EquipmentMonitorService.createOrSaveEquipment, [], undefined, onEquipmentInfoSaved, 
										EquipmentMonitorService.deleteEquipment, [equipmentId], onEquipmentDeleted);

	const isCreation = equipment === undefined || equipment._id === undefined;

	return (
		<Fragment>
			<CSSTransition in={visible} timeout={300} classNames="modal">
				<Modal isOpen={visible} toggle={modalLogic.cancel} className={className} fade={false}>
					<ModalHeader toggle={modalLogic.cancel}>
						<FontAwesomeIcon icon={isCreation? faPlusSquare : faEdit} />{' '}
						{!isCreation && <FormattedMessage {...equipmentInfoMsg.modalTitle} />}
						{isCreation && <FormattedMessage {...equipmentInfoMsg.modalCreationTitle} />}
					</ModalHeader>
					<ModalBody>
						{visible && <MyForm submit={modalLogic.handleSubmit} id="formEquipmentInfo" initialData={equipment}>
							<MyInput name="name" 			label={equipmentInfoMsg.name} 			type="text" 	required/>
							<MyInput name="brand" 			label={equipmentInfoMsg.brand} 			type="text" 	required/>
							<MyInput name="model" 			label={equipmentInfoMsg.model} 			type="text" 	required/>
							<MyInput name="installation" 	label={equipmentInfoMsg.installDateLabel} 	type="date" 	required/>
							<MyInput name="age" 			label={equipmentInfoMsg.age} tooltip={equipmentInfoMsg.ageToolTip} 			type="number" 	required min={0} />
						</MyForm>}
						<Alerts errors={modalLogic.alerts}/>
					</ModalBody>
					<ModalFooter>
						<Button type="submit" form="formEquipmentInfo" color="success">
							{!isCreation && <FormattedMessage {...equipmentInfoMsg.save} />}
							{isCreation && <FormattedMessage {...equipmentInfoMsg.create} />}
						</Button>
						<Button color="secondary" onClick={modalLogic.cancel}><FormattedMessage {...equipmentInfoMsg.cancel} /></Button>
						{equipment && equipment._id && <Button color="danger" onClick={modalLogic.handleDelete}><FormattedMessage {...equipmentInfoMsg.delete} /></Button>}
					</ModalFooter>
				</Modal>
			</CSSTransition>
			<ModalYesNoConfirmation visible={modalLogic.yesNoModalVisibility}
									toggle={modalLogic.toggleModalYesNoConfirmation}
									yes={modalLogic.yesDelete}
									no={modalLogic.toggleModalYesNoConfirmation}
									title={equipmentInfoMsg.equipmentDeleteTitle}
									message={equipmentInfoMsg.equipmentDeleteMsg} 
									className='modal-dialog-centered'/>
		</Fragment>
	);
}

ModalEquipmentInfo.propTypes = {
	equipment: PropTypes.object,
	onEquipmentInfoSaved: PropTypes.func.isRequired,
	onEquipmentDeleted: PropTypes.func.isRequired,
	visible: PropTypes.bool.isRequired,
	toggle: PropTypes.func.isRequired,
	className: PropTypes.string,
};

export default ModalEquipmentInfo;