import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import CardTaskDetails from '../CardTaskDetails';

const mockConsoleMethod = (realConsoleMethod) => {
    const ignoredMessages = [
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

describe("CardTaskDetails", () => {
    const equipment = {
        _uiId: '1234',
        name: 'engine',
        brand: 'nanni',
        model: 'N3.30',
        age: 2563,
        installation: new Date('2011-02-22T16:00:00.000Z')
    }

    const task1 = {
        _uiId: 'task1',
        name: 'taskname1',
        periodInMonth: 12,
        description: 'task1 description',
        nextDueDate: new Date('2011-02-22T16:00:00.000Z'),
        usagePeriodInHour: 200,
        usageInHourLeft: 20,
        level: 1
    }

    const task2 = {
        _uiId: 'task2',
        name: 'taskname2',
        periodInMonth: 24,
        description: 'task2 description',
        nextDueDate: new Date('2018-02-22T16:00:00.000Z'),
        usagePeriodInHour: 400,
        usageInHourLeft: 20,
        level: 3
    }

    const tasks = [task1, task2];
    const onTaskChangedMock = jest.fn();
    const onTaskDeletedMock = jest.fn();
    const changeCurrentTaskMock = jest.fn();

    beforeEach(() => {
        onTaskChangedMock.mockClear();
        onTaskDeletedMock.mockClear();
        changeCurrentTaskMock.mockClear();
    });

    it("Should render correctly even if the equipment is undefined", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={undefined} 
            tasks={[]} 
            currentTask={undefined}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
    });

    it("Should render correctly even if the task array is empty", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={[]} 
            currentTask={undefined}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
    });

    it("Should render correctly even if the current task is undefined", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={undefined}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Assert
        expect(wrapper).toMatchSnapshot();
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
    });

    it("Should render the task 1 details", () => {
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task1}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        expect(wrapper.find('.card-title').text()).toEqual(task1.name + ' Done');
        expect(wrapper.find('.badge-success').text()).toEqual("Done");
        expect(wrapper.find('.card-control-prev-icon').hasClass('invisible')).toEqual(true);
        expect(wrapper.find('.card-text').text()).toEqual(task1.description);
        expect(wrapper.find('.card-control-next-icon').hasClass('invisible')).toEqual(false);

        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
    });

    it("should stay the same with task1", () => {
        const tree = renderer.create(<CardTaskDetails 
                                        equipment={equipment} 
                                        tasks={tasks} 
                                        currentTask={task1}
                                        onTaskChanged={onTaskChangedMock}
                                        onTaskDeleted={onTaskDeletedMock}
                                        changeCurrentTask={changeCurrentTaskMock} 
                                    />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("Should render the task 2 details", () => {
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task2}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        expect(wrapper.find('.card-title').text()).toEqual(task2.name + ' ToDo');
        expect(wrapper.find('.badge-danger').text()).toEqual("ToDo");
        expect(wrapper.find('.card-control-prev-icon').hasClass('invisible')).toEqual(false);
        expect(wrapper.find('.card-text').text()).toEqual(task2.description);
        expect(wrapper.find('.card-control-next-icon').hasClass('invisible')).toEqual(true);

        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
    });

    it("should stay the same with task2", () => {
        const tree = renderer.create(<CardTaskDetails 
                                        equipment={equipment} 
                                        tasks={tasks} 
                                        currentTask={task2}
                                        onTaskChanged={onTaskChangedMock}
                                        onTaskDeleted={onTaskDeletedMock}
                                        changeCurrentTask={changeCurrentTaskMock} 
                                    />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("Should call changeCurrentTask after clicking on the next button", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task1}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Act
        wrapper.find('.button-next-task').simulate('click');

        // Assert
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(1);
        expect(changeCurrentTaskMock.mock.calls[0][0]).toBe(task2);
        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
    });

    it("Should not call changeCurrentTask after clicking on the next button because task2 is the last task", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task2}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Act
        wrapper.find('.button-next-task').simulate('click');

        // Assert
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
    });

    it("Should not call changeCurrentTask after clicking on the prev button because task1 is the first task", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task1}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Act
        wrapper.find('.button-previous-task').simulate('click');

        // Assert
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(0);
        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
    });

    it("Should call changeCurrentTask after clicking on the prev button", () => {
        // Arrange
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task2}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        // Act
        wrapper.find('.button-previous-task').simulate('click');

        // Assert
        expect(changeCurrentTaskMock).toHaveBeenCalledTimes(1);
        expect(changeCurrentTaskMock.mock.calls[0][0]).toBe(task1);
        expect(onTaskChangedMock).toHaveBeenCalledTimes(0);
        expect(onTaskDeletedMock).toHaveBeenCalledTimes(0);
    });
});