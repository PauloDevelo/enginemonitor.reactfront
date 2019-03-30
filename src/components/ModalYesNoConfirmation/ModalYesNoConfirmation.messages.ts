import {defineMessages, Messages} from "react-intl";

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

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;