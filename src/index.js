import * as log from 'loglevel';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';

import './index.css';

import App from './components/App/App';
import * as serviceWorker from './serviceWorker';

import messagesFr from './translations/fr.json';
import messagesEn from './translations/en.json';

const messages = {
  fr: messagesFr,
  en: messagesEn,
};

const { language } = navigator;
const shortLanguage = navigator.language.split(/[-_]/)[0]; // language without region code

log.setLevel('trace', false);

ReactDOM.render(<IntlProvider locale={language} messages={messages[shortLanguage]}><App /></IntlProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
