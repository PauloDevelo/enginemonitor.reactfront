import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { FormattedMessage } from 'react-intl';

import {  mount, shallow } from 'enzyme';

import ToolTip from '../ToolTip'

describe('Component ToolTip', () =>{
    let element;
    let container;

    beforeEach(() => {
        element = document.createElement('div');
        container = document.createElement('div');
        element.innerHTML = '<p id="target">This is the tooltip <span id="innerTarget">target</span>.</p>';
        element.setAttribute('id', 'testContainer');
        container.setAttribute('id', 'container');
        element.appendChild(container);
        document.body.appendChild(element);
    
        jest.useFakeTimers();
      });

    it('should render as a simple tooltip', () => {
        // Arrange
        const message = { id:"tooltip", defaultMessage: "hello world", description: "a tooltip"};

        // Act
        const wrapper = mount(<ToolTip tooltip={message}/>, { attachTo: container });

        // Assert
        const innerToolTip = wrapper.find(UncontrolledTooltip);
        const formatedMessage = innerToolTip.props().children;
    
        expect(formatedMessage.props.defaultMessage).toEqual(message.defaultMessage);
        expect(formatedMessage.props.id).toEqual(message.id);
    });

    it('should be the same as the previous snapshot', () => {
        // Arrange
        const message = { id:"tooltip", defaultMessage: "hello world", description: "a tooltip"};

        // Act
        const wrapper = mount(<ToolTip tooltip={message}/>, { attachTo: container });

        // Assert
        expect(wrapper).toMatchSnapshot();
    });

    
});