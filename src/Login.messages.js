import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    email: {
        id: "email",
        defaultMessage: "Email",
        description: "Label"
    },
    password: {
        id: "password",
        defaultMessage: "Password",
        description: "Label"
    },
    login: {
        id: "login",
        defaultMessage: "Login",
        description: "Label"
    },
    modaltitle: {
        id: "modalLogintitle",
        defaultMessage: "Login with an existing account",
        description: "Modal title"
    },
    remember: {
        id: "remember",
        defaultMessage: "Remember me",
        description: "Label"
    },
    invalid: {
        id: "invalid",
        defaultMessage: "is invalid",
        description: "Error message"
    }
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;