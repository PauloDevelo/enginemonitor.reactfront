import {defineMessages, Messages} from "react-intl";

const messages: Messages = {
    ackDate: {
        id: "ackDate",
        defaultMessage: "Realisation date",
        description: "Colum header"
    },
    age: {
		id: "ageColumHeader",
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
    },
    taskHistoryTitle: {
        id: "taskHistoryTitle",
        defaultMessage: "Task history",
        description: "Title"
    },
    monthperiod: {
        id: "monthperiod",  
        defaultMessage: "{month, plural, one {month} other {# months}}",
        description: "Month period"
    },
    yearperiod: {
        id: "yearperiod",  
        defaultMessage: "{year, plural, one {year} other {# years}}",
        description: "Year period"
    },
    dayperiod: {
        id: "dayperiod",  
        defaultMessage: "{day, plural, one {day} other {# days}}",
        description: "Day period"
    }
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;