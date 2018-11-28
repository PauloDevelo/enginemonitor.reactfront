import {defineMessages} from "react-intl";
import {type Messages} from "./MessageDescriptor"

const messages: Messages = {
    installedOn: {
        id: "installedOn",
        defaultMessage: "Installed on ",
    },
};

const definedMessages: typeof messages = defineMessages(messages);

export default definedMessages;