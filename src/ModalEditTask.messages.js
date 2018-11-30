import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
	modalEditTaskTitle: {
    id: "modalEditTaskTitle",
    defaultMessage: "Task edition",
		description: "Panel title"
  },
  modalCreationTaskTitle: {
    id: "modalCreateTaskTitle",
    defaultMessage: "Task creation",
		description: "Panel title"
  },
	name: {
    id: "name",
    defaultMessage: "Name",
		description: "Label"
  },
	engineHours: {
    id: "engineHours",
    defaultMessage: "Period in engine hour",
		description: "Label"
  },
	month: {
    id: "month",
    defaultMessage: "Period in month",
		description: "Label"
  },
	description: {
    id: "taskdesc",
    defaultMessage: "Description",
		description: "Label"
  },
	save: {
    id: "save",
    defaultMessage: "Save",
		description: "Button"
  },
	cancel: {
    id: "cancel",
    defaultMessage: "Cancel",
		description: "Button"
  },
  delete: {
    id: "delete",
    defaultMessage: "Delete",
		description: "Button"
  },
  ack:{
    id: "ack",
    defaultMessage: "Acknowledge",
		description: "Button"
  },
  edit:{
    id: "edit",
    defaultMessage: "Edit",
		description: "Button"
  },
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;