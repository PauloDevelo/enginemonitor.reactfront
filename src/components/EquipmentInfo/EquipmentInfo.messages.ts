import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
	ageAcquisitionType: {
    id: "ageAcquisitionType",
		defaultMessage: "How do you want to measure the equipment usage time ?",
		description: "Select input question"
	},
	ageAcquisitionTypeTooltip: {
    id: "ageAcquisitionTypeTooltip",
		defaultMessage: "<b>Equipment maintenance</b> application needs to know the equipment usage time to alert you when a task has to be performed.\n3 different ways exist to define the equipment usage time.\nThe most straightforward is to use the current time.\nAnother one is to input manually this time in the application.\nThe last method, the most accurate and automatic is to use a usage time tracker that will publish the usage time online.",
		description: "Select input question"
	},
	time: {
    id: "timeType",
		defaultMessage: "With the current time",
		description: "Select input value"
	},
	manualEntry: {
    id: "manualEntryType",
		defaultMessage: "With a manual input",
		description: "Select input value"
	},
	tracker: {
    id: "trackerType",
		defaultMessage: "With a usage time tracker",
		description: "Select input value"
  },
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
	ageUrl: {
		id: "ageUrl",
    defaultMessage: "Equipment Age URL",
		description: "Label"
	},
	ageUrlToolTip: {
		id: "ageUrlToolTip",
    defaultMessage: "Url allowing to get the equipment usage time in hour.",
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