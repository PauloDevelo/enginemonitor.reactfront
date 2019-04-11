import React, { Fragment } from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';

import CardTaskDetails from '../CardTaskDetails'

describe("CardTaskDetails", () => {
    const equipment = {
        _id: '1234',
        name: 'engine',
        brand: 'nanni',
        model: 'N3.30',
        age: 2563,
        installation: new Date(2011, 1, 23)
    }

    const task1 = {
        _id: 'task1',
        name: 'taskname1',
        periodInMonth: 12,
        description: 'task1 description',
        nextDueDate: new Date(2011, 1, 23),
        usagePeriodInHour: 200,
        usageInHourLeft: 20,
        level: 1
    }

    const task2 = {
        _id: 'task2',
        name: 'taskname2',
        periodInMonth: 24,
        description: 'task2 description',
        nextDueDate: new Date(2018, 1, 23),
        usagePeriodInHour: 400,
        usageInHourLeft: 20,
        level: 3
    }

    const tasks = [task1, task2];
    const onTaskChangedMock = jest.fn();
    const onTaskDeletedMock = jest.fn();
    const changeCurrentTaskMock = jest.fn();

    it("Should render the task details", () => {
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

    it("Should render the task details", () => {
        const wrapper = mount(<CardTaskDetails 
            equipment={equipment} 
            tasks={tasks} 
            currentTask={task2}
            onTaskChanged={onTaskChangedMock}
            onTaskDeleted={onTaskDeletedMock}
            changeCurrentTask={changeCurrentTaskMock} 
        />);

        expect(wrapper.find('.card-title').text()).toEqual(task2.name + ' Todo');
        expect(wrapper.find('.badge-danger').text()).toEqual("Todo");
        expect(wrapper.find('.card-control-prev-icon').hasClass('invisible')).toEqual(false);
        expect(wrapper.find('.card-text').text()).toEqual(task2.description);
        expect(wrapper.find('.card-control-next-icon').hasClass('invisible')).toEqual(true);
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

});