import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
    ackDate: {
        id: "ackDate",
        defaultMessage: "Realisation date",
        description: "Colum header"
    },
    age: {
		id: "age",
        defaultMessage: "Equipment Age",
		description: "Colum header"
    },
    remarks: {
        id: "remarks",
        defaultMessage: "Remarks",
        description: "Colum header"
    },
    errorFetching: {
        id: "errorFetching",
        defaultMessage: "Something went wrong ...",
        description: "Error message"
    }
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;