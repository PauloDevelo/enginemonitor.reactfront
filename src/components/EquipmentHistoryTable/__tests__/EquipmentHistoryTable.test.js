import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import React from 'react';
import { mount } from 'enzyme';

import EquipmentHistoryTable from '../EquipmentHistoryTable';

describe("EquipmentHistoryTable", () => {
    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push('[React Intl] Could not find required `intl` object.');
    });

    beforeEach(() => {
        
    });

    afterEach(() => {

    });

    // it("Should render correctly even with minimal props", () => {
    //     // There is an issue when rendering the Table ....
    // });
});