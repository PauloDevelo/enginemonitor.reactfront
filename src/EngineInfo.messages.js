import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
  installedOn: {
    id: "installedOn",
    defaultMessage: "Installed on ",
  },
	today: {
    id: "today",
    defaultMessage: "Today, ",
  },
	edit: {
    id: "edit",
    defaultMessage: "Edit",
		description: "Button edit"
  },
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;