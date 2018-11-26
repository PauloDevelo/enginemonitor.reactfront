import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from "react-intl";

import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

import locale_en from 'react-intl/locale-data/en';
import locale_fr from 'react-intl/locale-data/fr';

import messages_fr from "./translations/fr.json";
import messages_en from "./translations/en.json";

addLocaleData([...locale_en, ...locale_fr]);

const messages = {
    'fr': messages_fr,
    'en': messages_en
};

const language = navigator.language.split(/[-_]/)[0];  // language without region code


ReactDOM.render(<IntlProvider locale={language} messages={messages[language]}>
					<App />
				</IntlProvider>, 
				document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
