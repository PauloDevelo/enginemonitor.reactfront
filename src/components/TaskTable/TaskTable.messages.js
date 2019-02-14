import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
	tasklistTitle: {
    id: "tasklistTitle",
    defaultMessage: "Task list",
		description: "Panel title"
  },
	createbutton: {
    id: "createbutton",
    defaultMessage: "Create",
		description: "Create button"
  },
	taskname: {
    id: "taskname",
    defaultMessage: "Task name",
		description: "Task name header"
  },
	todo: {
    id: "todo",
    defaultMessage: "To do",
		description: "To do header"
  },
	taskdesc: {
    id: "taskdesc",
    defaultMessage: "Description",
		description: "Description header"
  },
	shouldhavebeendone: {
    id: "shouldhavebeendone",
    defaultMessage: "Should have been done the ",
		description: "Sentence"
  },
	shouldbedone: {
    id: "shouldbedone",
    defaultMessage: "Should be done the ",
		description: "Sentence"
  },
	shouldhavebeendonein1: {
    id: "shouldhavebeendonein",
    defaultMessage: "Should have been done ",
		description: "Sentence"
  },
	shouldbedonein1: {
    id: "shouldbedonein1",
    defaultMessage: "Should be done in ",
		description: "Sentence"
  },
	shouldhavebeendonein2: {
    id: "shouldhavebeendonein2",
    defaultMessage: " equipment ago or ",
		description: "Sentence"
  },
	shouldbedonein2: {
    id: "shouldbedonein2",
    defaultMessage: " equipment or ",
		description: "Sentence"
  },
  tobedonemonth: {
    id: "tobedonemonth",
    defaultMessage: "To do every ",
		description: "Sentence"
  },
  orevery: {
    id: "orevery",
    defaultMessage: " or every ",
		description: "Sentence"
  },
  monthperiod: {
    id: "monthperiod",  
    defaultMessage: "{month, plural, one {month} other {# months}}",
    description: "Month period"
  },
  ackDate: {
    id: "ackDate",
    defaultMessage: "Realisation date",
    description: "Colum header"
  },
  remarks: {
    id: "remarks",
    defaultMessage: "Remarks",
    description: "Colum header"
  },
  age: {
		id: "age",
    defaultMessage: "Equipment Age",
		description: "Label"
	}
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;