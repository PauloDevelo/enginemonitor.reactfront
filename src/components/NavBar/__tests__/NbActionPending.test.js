import React from 'react';
import { mount } from 'enzyme';

import actionManager from '../../../services/ActionManager';
import NbActionPending from '../NbActionPending'

jest.mock('../../../services/ActionManager');

const mockConsoleMethod = (realConsoleMethod) => {
    const ignoredMessages = [
        "test was not wrapped in act(...)",
        "[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback."
    ];

    return (message, ...args) => {
        const containsIgnoredMessage = ignoredMessages.some((ignoredMessage) => message.includes(ignoredMessage));

        if (!containsIgnoredMessage) {
        realConsoleMethod(message, ...args);
        }
    };
};
  
// Suppress console errors and warnings to avoid polluting output in tests.
console.warn = jest.fn(mockConsoleMethod(console.warn));
console.error = jest.fn(mockConsoleMethod(console.error));

describe('Component NbActionPending', () =>{
    it('should render a specific message when there is no action to sync', () => {
        // Arrange
        const resp = 0;
        actionManager.countAction.mockResolvedValue(resp);

        // Act
        const wrapper = mount(<NbActionPending />);
        
        return Promise
            .resolve(wrapper)
            .then(() => {
                wrapper.update();

                // Assert
                expect(wrapper).toMatchSnapshot();

                expect(wrapper).toContainExactlyOneMatchingElement("FormattedMessage");
                expect(wrapper.text()).toBe("synced");
            });
    });

    it('should render a specific message when there is several action to sync', () => {
        // Arrange
        const resp = 3;
        actionManager.countAction.mockResolvedValue(resp);

        // Act
        const wrapper = mount(<NbActionPending />);

        return Promise
            .resolve(wrapper)
            .then(() => {
                wrapper.update();

                // Assert
                expect(wrapper).toMatchSnapshot();

                expect(wrapper).toContainExactlyOneMatchingElement("FormattedMessage");
                expect(wrapper.text()).toBe("3 actions to sync");
            });
    });

    it('should render a specific message when there is one action to sync', () => {
        // Arrange
        const resp = 1;
        actionManager.countAction.mockResolvedValue(resp);

        // Act
        const wrapper = mount(<NbActionPending />);

        return Promise
            .resolve(wrapper)
            .then(() => {
                wrapper.update();

                // Assert
                expect(wrapper).toMatchSnapshot();

                expect(wrapper).toContainExactlyOneMatchingElement("FormattedMessage");
                expect(wrapper.text()).toBe("1 action to sync");
            });
    });
});