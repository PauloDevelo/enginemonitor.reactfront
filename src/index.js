import * as log from 'loglevel';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

import * as Sentry from '@sentry/browser';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker.js';

import messagesFr from './translations/fr.json';
import messagesEn from './translations/en.json';

import './fonts/Roboto-Medium.ttf';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://9b118304a0fe422f94456016f2aa6993@sentry.io/3533569' });
}

const messages = {
  fr: messagesFr,
  en: messagesEn,
};

const { language } = navigator;
const shortLanguage = navigator.language.split(/[-_]/)[0]; // language without region code

log.setLevel(process.env.REACT_APP_LOG_LEVEL, false);
log.info(`NODE_ENV=${process.env.NODE_ENV}`);

ReactDOM.render(
  <BrowserRouter>
    <IntlProvider locale={language} messages={messages[shortLanguage]}>
      <App />
    </IntlProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
