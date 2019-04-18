import {defineMessages, Messages} from "react-intl";

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
    id: "taskname",
    defaultMessage: "Name",
		description: "Label"
  },
	usagePeriodInHour: {
    id: "usagePeriodInHour",
    defaultMessage: "Period in usage hour",
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
  taskDeleteTitle: {
    id: "taskDeleteTitle",
    defaultMessage: "Delete task",
    description: "Modal title"
  },
  taskDeleteMsg: {
    id: "taskDeleteMsg",
    defaultMessage: "Are you sure you want to delete this task?",
    description: "User message"
  },
};

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;