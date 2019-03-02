import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    signout: {
        id: "signout",
        defaultMessage: "Signout",
		description: "Menu"
    },
}

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;