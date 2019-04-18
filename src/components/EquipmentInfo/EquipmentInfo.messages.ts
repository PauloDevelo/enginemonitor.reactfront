import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
  installedOn: {
    id: "installedOn",
    defaultMessage: "installed on ",
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
		id: "equipmentname",
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
    defaultMessage: "Equipment Age in hour",
		description: "Label"
	},
	ageToolTip: {
		id: "ageToolTip",
    defaultMessage: "Amount of time in hour the equipment was used.",
		description: "Tooltip"
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
	import: {
		id: "import",
		defaultMessage: "Import",
		description: "Button"
	}
};

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;