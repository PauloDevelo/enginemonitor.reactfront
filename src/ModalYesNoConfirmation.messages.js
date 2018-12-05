import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    yes: {
        id: "yes",
        defaultMessage: "Yes",
		description: "Button"
    },
    no: {
        id: "no",
        defaultMessage: "No",
		description: "Button"
    },
}

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;