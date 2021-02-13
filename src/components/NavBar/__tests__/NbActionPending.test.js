import React from 'react';
import { IntlProvider } from 'react-intl';
import { mount } from 'enzyme';
import ignoredMessages from '../../../testHelpers/MockConsole';

import actionManager from '../../../services/ActionManager';
import NbActionPending from '../NbActionPending';

jest.mock('../../../services/ActionManager');

describe('Component NbActionPending', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  it('should render a specific message when there is no action to sync', () => {
    // Arrange
    actionManager.countAction.mockImplementation(() => 0);

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <NbActionPending />
      </IntlProvider>,
    );

    return Promise
      .resolve(wrapper)
      .then(() => {
        wrapper.update();

        // Assert
        expect(wrapper).toMatchSnapshot();

        expect(wrapper).toContainExactlyOneMatchingElement('FormattedMessage');
        expect(wrapper.text()).toBe('synced');
      });
  });

  it('should render a specific message when there is several action to sync', () => {
    // Arrange
    const resp = 3;
    actionManager.countAction.mockImplementation(() => resp);

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <NbActionPending />
      </IntlProvider>,
    );

    return Promise
      .resolve(wrapper)
      .then(() => {
        wrapper.update();

        // Assert
        expect(wrapper).toMatchSnapshot();

        expect(wrapper).toContainExactlyOneMatchingElement('FormattedMessage');
        expect(wrapper.text()).toBe('3 actions to sync');
      });
  });

  it('should render a specific message when there is one action to sync', () => {
    // Arrange
    const resp = 1;
    actionManager.countAction.mockImplementation(() => resp);

    // Act
    const wrapper = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <NbActionPending />
      </IntlProvider>,
    );

    return Promise
      .resolve(wrapper)
      .then(() => {
        wrapper.update();

        // Assert
        expect(wrapper).toMatchSnapshot();

        expect(wrapper).toContainExactlyOneMatchingElement('FormattedMessage');
        expect(wrapper.text()).toBe('1 action to sync');
      });
  });
});
