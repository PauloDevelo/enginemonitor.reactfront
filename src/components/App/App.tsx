// eslint-disable-next-line no-use-before-define
import React from 'react';
import { Route, Switch } from 'react-router-dom';

// We will create these two pages in a moment
import MainPanel from '../MainPanel/MainPanel';
import PrivacyPolicyModal from '../PrivacyPolicyModal/PrivacyPolicyModal';

export default function App() {
  return (
    <Switch>
      <Route exact path="/" component={MainPanel} />
      <Route path="/PrivacyPolicy" component={PrivacyPolicyModal} />
      <Route path="/:niceKey" component={MainPanel} />
    </Switch>
  );
}
