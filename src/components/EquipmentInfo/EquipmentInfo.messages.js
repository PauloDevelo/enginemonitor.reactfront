import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor";

const messages: Messages = {
  installedOn: {
    id: "installedOn",
    defaultMessage: "Installed on ",
  },
	today: {
    id: "today",
    defaultMessage: "Today, ",
  },
	edit: {
    id: "edit",
    defaultMessage: "Edit",
		description: "Button edit"
  },
	modalTitle: {
		id: "modalTitle",
    defaultMessage: "Equipment Edition",
		description: "Equipment Info Edition Modal"
	},
	modalCreationTitle: {
		id: "modalCreationTitle",
    defaultMessage: "Equipment Creation",
		description: "Equipment Info Edition Modal"
	},
	save: {
		id: "save",
    defaultMessage: "Save",
		description: "Button save"
	},
	create: {
		id: "createbutton",
    defaultMessage: "Create",
		description: "Button create"
	},
	cancel: {
		id: "cancel",
    defaultMessage: "Cancel",
		description: "Button cancel"
	},
	name: {
		id: "name",
    defaultMessage: "Name",
		description: "Label"
	},
	brand: {
		id: "brand",
    defaultMessage: "Brand",
		description: "Label"
	},
	model: {
		id: "model",
    defaultMessage: "Model",
		description: "Label"
	},
	installDateLabel: {
		id: "installDateLabel",
    defaultMessage: "Installation Date",
		description: "Label"
	},
	age: {
		id: "age",
    defaultMessage: "Equipment Age",
		description: "Label"
	},
	serialPort: {
		id: "serialPort",
    defaultMessage: "Serial Port",
		description: "Label"
	},
	delete: {
		id: "delete",
		defaultMessage: "Delete",
		description: "delete button"
	},
	equipmentDeleteTitle: {
		id: "equipmentDeleteTitle",
		defaultMessage: "Delete Equipment",
		description: "Modal title"
	},
	equipmentDeleteMsg: {
		id: "equipmentDeleteMsg",
		defaultMessage: "Are you sure you want to delete this equipment?",
		description: "Confirmation question"
	},
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;