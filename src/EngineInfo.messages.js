import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

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
    defaultMessage: "Engine Edition",
		description: "Engine Info Edition Modal"
	},
	save: {
		id: "save",
    defaultMessage: "Save",
		description: "Button save"
	},
	cancel: {
		id: "cancel",
    defaultMessage: "Cancel",
		description: "Button cancel"
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
	engineAge: {
		id: "engineAge",
    defaultMessage: "Engine Age",
		description: "Label"
	},
	serialPort: {
		id: "serialPort",
    defaultMessage: "Serial Port",
		description: "Label"
	},
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;