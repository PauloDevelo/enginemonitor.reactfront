import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    defaultTitle: {
        id: "defaultTitle",
        defaultMessage: "",
		description: "Modal title"
    },
    defaultMsg: {
        id: "defaultMsg",
        defaultMessage: "",
		description: "User message"
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
    entryDeleteTitle: {
        id: "entryDeleteTitle",
        defaultMessage: "Delete entry",
		description: "Modal title"
    },
    entryDeleteMsg: {
        id: "entryDeleteMsg",
        defaultMessage: "Are you sure you want to delete this entry?",
		description: "User message"
    },
}

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;