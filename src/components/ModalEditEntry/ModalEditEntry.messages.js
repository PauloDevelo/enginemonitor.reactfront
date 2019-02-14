import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    modalEditEntryTitle: {
        id: "modalEditEntryTitle",
        defaultMessage: "Entry edition",
		description: "Panel title"
    },
    modalAckTitle: {
        id: "modalAckTitle",
        defaultMessage: "Acknowledgment",
		description: "Panel title"
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
    name: {
        id: "name",
        defaultMessage: "Name",
        description: "Label"
    },
    date: {
        id: "date",
        defaultMessage: "Date",
        description: "Label"
    },
    age: {
		id: "age",
        defaultMessage: "Equipment Age",
		description: "Label"
    },
    remarks: {
        id: "remarks",
        defaultMessage: "Remarks",
        description: "Label"
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
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;