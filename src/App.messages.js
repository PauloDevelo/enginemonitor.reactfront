import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
  component: {
    id: "component",
    defaultMessage: "Component",
    description: "Section menu",
  },
	welcome: {
		id: "welcome",
		defaultMessage: "Welcome to React",
		description: "Welcome message in Jumbotron",
	},
	viewreactdoc: {
		id: "viewreactdoc",
		defaultMessage: "View Reactstrap Docs",
	},
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;