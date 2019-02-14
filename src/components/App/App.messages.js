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
    signout: {
        id: "signout",
        defaultMessage: "Signout",
		description: "Menu"
    },
}

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;