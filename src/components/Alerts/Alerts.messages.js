import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

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
    }
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;