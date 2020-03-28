
import { mount } from 'enzyme';
// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';

import React from 'react';
import { IntlProvider } from 'react-intl';
import ignoredMessages from '../../../testHelpers/MockConsole';

import EquipmentInfoTab from '../EquipmentInfoTab';

import imageProxy from '../../../services/ImageProxy';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

jest.mock('../../../services/ImageProxy');
jest.mock('localforage');

describe('EquipmentInfoTab', () => {
  const equipment = {
    _uiId: '1234',
    name: 'engine',
    brand: 'nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date('2011-02-22T16:00:00.000Z'),
  };

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
    ignoredMessages.push('[React Intl] Missing message');
    ignoredMessages.push('MISSING_TRANSLATION');
  });

  beforeEach(() => {
    imageProxy.fetchImages.mockResolvedValue([]);
  });

  afterEach(() => {
    imageProxy.fetchImages.mockRestore();
  });

  it('Should render an equipment', async () => {
    // Arrange
    const displayEquipment = jest.fn();

    // Act
    const equipmentInfoTab = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentInfoTab equipment={equipment} displayEquipment={displayEquipment} />
      </IntlProvider>,
    );
    await updateWrapper(equipmentInfoTab);

    // Assert
    expect(displayEquipment).toHaveBeenCalledTimes(0);

    expect(equipmentInfoTab.find('FormattedDate').props().value).toBe(equipment.installation);
    expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.model);
    expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.brand);
    expect(equipmentInfoTab.find('TabPane')).toIncludeText(equipment.age);
    expect(equipmentInfoTab).toMatchSnapshot();
  });

  it('Should render the equipment edition modal when clicking on the edit button', async () => {
    // Arrange
    const displayEquipment = jest.fn();
    const equipmentInfoTab = mount(
      <IntlProvider locale="en-US" timeZone="Asia/Kuala_Lumpur">
        <EquipmentInfoTab equipment={equipment} displayEquipment={displayEquipment} />
      </IntlProvider>,
    );
    await updateWrapper(equipmentInfoTab);

    // Act
    equipmentInfoTab.find('TabPane').find('Button').at(0).simulate('click');

    // Assert
    expect(displayEquipment).toHaveBeenCalledTimes(1);
  });
});
