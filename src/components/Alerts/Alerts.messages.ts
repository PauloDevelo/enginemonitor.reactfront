import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
    date: {
        id: "date",
        defaultMessage: "Date",
        description: "Label"
    },
    age: {
        id: "age",
        defaultMessage: "Age",
        description: "Label"
    },
    remarks: {
        id: "remarks",
        defaultMessage: "Remarks",
        description: "Label"
    },
    brand: {
        id: "brand",
        defaultMessage: "Brand",
        description: "Label"
    },
    model: {
        id: "model",
        defaultMessage: "Model",
        description: "Label"
    },
    usagePeriodInHour: {
        id: "usagePeriodInHour",
        defaultMessage: "Usage Period in hour",
        description: "Label"
    },
    periodInMonth: {
        id: "periodInMonth",
        defaultMessage: "Period in month",
        description: "Label"
    },
    description: {
        id: "description",
        defaultMessage: "Description",
        description: "Label"
    },
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
    invalid: {
        id: "invalid",
        defaultMessage: "is invalid",
        description: "Error message"
    },
    name: {
        id: "name",
        defaultMessage: "Name",
        description: "Label"
    },
    firstname: {
        id: "firstname",
        defaultMessage: "Firstname",
        description: "Label"
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
    needVerification: {
        id: "needVerification",
        defaultMessage: "needs to be checked. Please check your emails.",
        description: "Error message"
    },
    creatingUser: {
        id: "creatingUser",
        defaultMessage: "Creating the user ...",
        description: "information message"
    },
    emailSent: {
        id: "emailSent",
        defaultMessage: "An email has been sent for the email verification...",
        description: "information message"
    },
    confirmPasswordChange: {
        id: "confirmPasswordChange",
        defaultMessage: "An email has been sent. Please, confirm your password change by clicking the link.",
		description: "confirmation message"
    },
    changingPassword: {
        id: "changingPassword",
        defaultMessage: "Changing password ...",
        description: "Information message"
    },
    message: {
        id: "message",
        defaultMessage: "Error message:",
        description: "label"
    },
    passwordsHaveToBeIdentical: {
        id:"passwordsHaveToBeIdentical",
        defaultMessage: "The passwords are different. Please re-type the passwords.",
        description: "message information"
    }
};

const definedMessages: Messages = defineMessages(messages);

export default definedMessages;