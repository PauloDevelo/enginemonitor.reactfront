import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
    signout: {
        id: "signout",
        defaultMessage: "Signout",
		description: "Menu"
    },
    today: {
        id: "today",
        defaultMessage: "Today, ",
    },
}

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;