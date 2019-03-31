import {defineMessages, Messages} from "react-intl";

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
    },
    modalSignupTitle: {
        id: "modalSignupTitle",
        defaultMessage: "Signup",
        description: "Modal title"
    },
    name: {
        id: "name",
        defaultMessage: "Last Name",
        description: "Label"
    },
    firstname: {
        id: "firstname",
        defaultMessage: "Firstname",
        description: "Label"
    },
    cancel: {
		id: "cancel",
        defaultMessage: "Cancel",
		description: "Button cancel"
    },
    signup: {
		id: "signup",
        defaultMessage: "Signup",
		description: "Button signup"
    },
    alreadyexisting: {
        id: "alreadyexisting",
        defaultMessage: "already exist",
		description: "Error message"
    },
    isrequired: {
        id: "isrequired",
        defaultMessage: "is required",
		description: "Error message"
    },
    loginerror: {
        id: "loginerror",
        defaultMessage: "Error: ",
        description: "Error message"
    },
    loginfailed: {
        id: "loginfailed",
        defaultMessage: "Login failed",
        description: "Login failed"
    },
    resetPassword: {
        id: "resetPassword",
        defaultMessage: "Reset password",
        description: "Button title"
    },
    sendVerification: {
        id: "sendVerification",
        defaultMessage: "Send Verification",
        description: "Button title"
    }
};

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;