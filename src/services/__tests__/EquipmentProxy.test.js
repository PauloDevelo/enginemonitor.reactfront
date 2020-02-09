import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import syncService from '../SyncService';
import storageService from '../StorageService';
import equipmentProxy from '../EquipmentProxy';
import actionManager from '../ActionManager';
import assetManager from '../AssetManager';

import { updateEquipment } from '../../helpers/EquipmentHelper';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test EquipmentProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function EquipmentProxy.existEquipment expects a non null and non undefined equipment id.');
  });

  const urlFetchEquipment = `${process.env.REACT_APP_URL_BASE}equipments/asset_01/`;

  const equipmentToSave = {
    _uiId: 'an id generated by the front',
    name: 'engine',
    brand: 'Nanni',
    model: 'N3.30',
    age: 2563,
    installation: new Date(2019, 6, 10),
    ageAcquisitionType: 1,
    ageUrl: '',
  };

  beforeEach(async () => {
    const user = { email: 'test@gmail.com' };
    await storageService.openUserStorage(user);

    assetManager.setCurrentAsset({
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    });
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchEquipment, undefined);
    storageService.closeUserStorage();

    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
  });

  const createOrSaveEquipmentParams = [
    {
      isOnline: false, expectedPostCounter: 0, expectedNbEquipment: 1, expectedNbAction: 1,
    },
    {
      isOnline: true, expectedPostCounter: 1, expectedNbEquipment: 1, expectedNbAction: 0,
    },
  ];

  describe.each(createOrSaveEquipmentParams)('createOrSaveEquipment', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      let postCounter = 0;
      httpProxy.post.mockImplementation((url, data) => {
        postCounter++;
        return Promise.resolve(data);
      });

      // Act
      const equipmentSaved = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

      // Assert
      expect(postCounter).toBe(arg.expectedPostCounter);
      expect(equipmentSaved).toEqual(equipmentToSave);

      const equipments = await storageService.getItem(urlFetchEquipment);
      expect(equipments.length).toBe(arg.expectedNbEquipment);

      if (arg.expectedNbEquipment > 0) {
        const storedEquipment = updateEquipment(equipments[0]);
        expect(storedEquipment).toEqual(equipmentToSave);
      }

      expect(await actionManager.countAction()).toBe(arg.expectedNbAction);
    });
  });

  const deleteEquipmentParams = [
    {
      isOnline: false, expectedDeleteCounter: 0, expectedNbEquipment: 0, expectedNbAction: 2,
    },
    {
      isOnline: true, expectedDeleteCounter: 1, expectedNbEquipment: 0, expectedNbAction: 0,
    },
  ];
  describe.each(deleteEquipmentParams)('deleteEquipment', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      const savedEquipment = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

      let postCounter = 0;
      httpProxy.deleteReq.mockImplementation(() => {
        postCounter++;
        return Promise.resolve({ equipment: savedEquipment });
      });

      // Act
      const equipmentDeleted = await equipmentProxy.deleteEquipment(equipmentToSave._uiId);

      // Assert
      expect(postCounter).toBe(arg.expectedDeleteCounter);
      expect(equipmentDeleted).toEqual(equipmentToSave);

      const equipments = await storageService.getItem(urlFetchEquipment);
      expect(equipments.length).toBe(arg.expectedNbEquipment);

      expect(await actionManager.countAction()).toBe(arg.expectedNbAction);
    });
  });

  const existEquipmentParams = [
    { isOnline: true, equipmentId: equipmentToSave._uiId, expectedResult: true },
    { isOnline: true, equipmentId: 'an_id', expectedResult: false },
    { isOnline: true, equipmentId: undefined, expectedResult: false },
    { isOnline: false, equipmentId: equipmentToSave._uiId, expectedResult: true },
    { isOnline: false, equipmentId: 'an_id', expectedResult: false },
    { isOnline: false, equipmentId: undefined, expectedResult: false },
  ];
  describe.each(existEquipmentParams)('existEquipment', (arg) => {
    it(`when ${JSON.stringify(arg)}`, async () => {
      // Arrange
      syncService.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      let getCounter = 0;
      httpProxy.get.mockImplementation(() => {
        getCounter++;
        return Promise.resolve({ name: 'engine' });
      });

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

      await equipmentProxy.createOrSaveEquipment(equipmentToSave);

      // Act
      const isEquipmentExist = await equipmentProxy.existEquipment(arg.equipmentId);

      // Assert
      expect(isEquipmentExist).toBe(arg.expectedResult);
      expect(getCounter).toBe(0);
    });
  });
});
