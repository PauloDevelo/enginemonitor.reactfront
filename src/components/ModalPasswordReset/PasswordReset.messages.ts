import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
    email: {
        id: "email",
        defaultMessage: "Email",
        description: "Label"
    },
    newPassword: {
        id: "newPassword",
        defaultMessage: "New Password",
        description: "Label"
    },
    retypeNewPassword: {
        id: "retypeNewPassword",
        defaultMessage: "Retype your new Password",
        description: "Label"
    },
    changePassword: {
        id: "changePassword",
        defaultMessage: "Change Password",
        description: "Label"
    },
    modalResetPasswordTitle: {
        id: "modalResetPasswordTitle",
        defaultMessage: "Change your password",
        description: "Modal title"
    },
    cancel: {
		id: "cancel",
        defaultMessage: "Cancel",
		description: "Button cancel"
    },
    close: {
        id: "close",
        defaultMessage: "Close",
		description: "Button Close"
    }
};

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;