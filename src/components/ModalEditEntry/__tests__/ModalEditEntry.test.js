import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import ignoredMessages from '../../../testHelpers/MockConsole';

import entryProxy from '../../../services/EntryProxy';

import ModalEditEntry from '../ModalEditEntry';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/EntryProxy');
jest.mock('localforage');

describe('ModalEditEntry', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry. Using default message as fallback.');
    ignoredMessages.push('a test was not wrapped in act');
  });

  afterEach(() => {
    entryProxy.createOrSaveEntry.mockReset();
    entryProxy.existEntry.mockReset();
    entryProxy.deleteEntry.mockReset();
  });

  const equipment = {
    _uiId: 'an id generated by the front',
    name: 'engine',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date(2019, 6, 10),
    ageAcquisitionType: 1,
    ageUrl: '',
  };

  const task = {
    _uiId: 'an_id_created_by_the_front_end_and_for_the_front_end',
    name: 'Vidange',
    usagePeriodInHour: 500,
    periodInMonth: 12,
    description: "Changer l'huile",
    nextDueDate: new Date(2020, 6, 10),
    level: 0,
    usageInHourLeft: undefined,
  };

  const entry = {
    _uiId: 'an_entry_id',
    name: 'vidange',
    date: new Date(2019, 9, 25),
    age: 400,
    remarks: 'oil was clean',
    taskUiId: 'an_id_created_by_the_front_end_and_for_the_front_end',
    equipmentUiId: 'an id generated by the front',
  };

  it('should render 3 buttons (cancel/save/delete) when we edit an existing entry', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    // Act
    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    await updateWrapper(modalEditEntry);

    // Assert
    expect(modalEditEntry).toMatchSnapshot();
    expect(modalEditEntry.props().visible).toBe(true);
    expect(modalEditEntry.find('ModalFooter').find('Button').length).toBe(3);
  });

  it('should render 2 buttons (cancel/create) when we create a new entry', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(false));

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    // Act
    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    await updateWrapper(modalEditEntry);

    // Assert
    expect(modalEditEntry.props().visible).toBe(true);
    expect(modalEditEntry.find('ModalFooter').find('Button').length).toBe(2);
  });

  it('Should display the button delete after saving the entry', async () => {
    // Arrange
    let isEntryExist = false;
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(isEntryExist));
    jest.spyOn(entryProxy, 'createOrSaveEntry').mockImplementation(async (equipmentId, taskId, newEntry) => {
      isEntryExist = true;
      return Promise.resolve(newEntry);
    });

    const onSavedEntry = jest.fn();

    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const myForm = modalEditEntry.find('Memo(MyForm)');

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalEditEntry);

    // Assert
    expect(entryProxy.createOrSaveEntry).toBeCalledTimes(1);
    expect(onSavedEntry).toBeCalledTimes(1);
    expect(isEntryExist).toBe(true);
    expect(modalEditEntry.find('ModalFooter').find('Button').length).toBe(3);
  });

  it('Should save the entry using the entry proxy when clicking on Save', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));
    jest.spyOn(entryProxy, 'createOrSaveEntry').mockImplementation(async (equipmentId, taskId, newEntry) => Promise.resolve(newEntry));

    const onSavedEntry = jest.fn();

    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const myForm = modalEditEntry.find('Memo(MyForm)');

    // Act
    myForm.simulate('submit');
    await updateWrapper(modalEditEntry);

    // Assert
    expect(entryProxy.createOrSaveEntry).toBeCalledTimes(1);
    expect(onSavedEntry).toBeCalledTimes(1);
    expect(toggleFn).toBeCalledTimes(1);
  });

  it('Should close the modal when clicking on Cancel', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const cancelButton = modalEditEntry.find('ModalFooter').find('Button').at(1);

    // Act
    cancelButton.simulate('click');
    await updateWrapper(modalEditEntry);

    // Assert
    expect(toggleFn).toBeCalledTimes(1);
  });

  it('The deletion should be preceded by a confirmation message', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const deleteButton = modalEditEntry.find('ModalFooter').find('Button').at(2);

    // Act
    deleteButton.simulate('click');
    await updateWrapper(modalEditEntry);

    // Assert
    const confirmationModal = modalEditEntry.find('ModalYesNoConfirmation').at(1);
    expect(confirmationModal.props().visible).toBe(true);
  });

  it('Clicking yes on the confirmation should call the entryProxy.delete function', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));
    jest.spyOn(entryProxy, 'deleteEntry');

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const deleteButton = modalEditEntry.find('ModalFooter').find('Button').at(2);

    deleteButton.simulate('click');
    await updateWrapper(modalEditEntry);

    const confirmationModal = modalEditEntry.find('ModalYesNoConfirmation').at(1);
    const yesButton = confirmationModal.find('ActionButton');

    // Act
    yesButton.simulate('click');
    await updateWrapper(modalEditEntry);

    // Assert
    expect(entryProxy.deleteEntry).toBeCalledTimes(1);
    expect(onDeletedEntry).toBeCalledTimes(1);
    expect(toggleFn).toBeCalledTimes(1);
    expect(modalEditEntry.find('ModalYesNoConfirmation').at(1).props().visible).toBe(false);
  });

  it('Clicking No on the confirmation should not call the entryProxy.delete function but just close the confirmation modal', async () => {
    // Arrange
    entryProxy.existEntry.mockImplementation(async () => Promise.resolve(true));
    jest.spyOn(entryProxy, 'deleteEntry');

    const onSavedEntry = jest.fn();
    const onDeletedEntry = jest.fn();
    let isVisible = true;
    const toggleFn = jest.fn().mockImplementation(() => {
      isVisible = !isVisible;
    });

    const modalEditEntry = mount(<ModalEditEntry equipment={equipment} task={task} entry={entry} visible={isVisible} saveEntry={onSavedEntry} deleteEntry={onDeletedEntry} toggle={toggleFn} />);
    const deleteButton = modalEditEntry.find('ModalFooter').find('Button').at(2);

    deleteButton.simulate('click');
    await updateWrapper(modalEditEntry);

    const confirmationModal = modalEditEntry.find('ModalYesNoConfirmation').at(1);
    const noButton = confirmationModal.find('Button').at(1);

    // Act
    noButton.simulate('click');
    await updateWrapper(modalEditEntry);

    // Assert
    expect(entryProxy.deleteEntry).toBeCalledTimes(0);
    expect(onDeletedEntry).toBeCalledTimes(0);
    expect(toggleFn).toBeCalledTimes(0);
    expect(modalEditEntry.find('ModalYesNoConfirmation').at(1).props().visible).toBe(false);
  });
});
