import ignoredMessages from '../../testHelpers/MockConsole';
import httpProxy from '../HttpProxy';
import userProxy from '../UserProxy';
import onlineManager from '../OnlineManager';
import storageService from '../StorageService';
import equipmentProxy from '../EquipmentProxy';
import actionManager from '../ActionManager';
import assetManager from '../AssetManager';
import entryProxy from '../EntryProxy';
import taskProxy from '../TaskProxy';
import imageProxy from '../ImageProxy';

import { updateEquipment } from '../../helpers/EquipmentHelper';
import HttpError from '../../http/HttpError';

jest.mock('../HttpProxy');
jest.mock('../OnlineManager');
jest.mock('../UserProxy');
jest.mock('../EntryProxy');
jest.mock('../TaskProxy');
jest.mock('../ImageProxy');

describe('Test EquipmentProxy', () => {
  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('The function EquipmentProxy.existEquipment expects a non null and non undefined equipment id.');
  });

  const urlFetchEquipment = `${process.env.REACT_APP_API_URL_BASE}equipments/asset_01/`;

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
    userProxy.getCredentials.mockImplementation(async () => Promise.resolve({ readonly: false }));

    const user = { email: 'test@gmail.com' };
    await storageService.openUserStorage(user);

    await assetManager.setCurrentAsset({
      _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
    });
  });

  afterEach(async () => {
    await actionManager.clearActions();
    storageService.setItem(urlFetchEquipment, undefined);
    storageService.closeUserStorage();

    httpProxy.setConfig.mockReset();
    httpProxy.post.mockReset();
    httpProxy.deleteReq.mockReset();
    httpProxy.get.mockReset();

    userProxy.getCredentials.mockRestore();

    entryProxy.onEquipmentDeleted.mockRestore();
    taskProxy.onEquipmentDeleted.mockRestore();
    imageProxy.onEntityDeleted.mockRestore();
    onlineManager.isOnlineAndSynced.mockRestore();
  });

  const onlineModes = [{ isOnline: false }, { isOnline: true }];
  describe('fetchEquipments', () => {
    it('should get the equipments online first and update the storage', async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(true));
      httpProxy.get.mockImplementation(async (url) => {
        if (url === urlFetchEquipment) {
          return (
            {
              equipments: [equipmentToSave],
            }
          );
        }
        throw new Error(`Unexpected url ${url}`);
      });

      // Act
      const equipments = await equipmentProxy.fetchEquipments();

      // Assert
      expect(equipments.length).toEqual(1);
      expect(equipments[0]).toEqual(equipmentToSave);

      const storedEquipments = await equipmentProxy.getStoredEquipment();
      expect(equipments).toEqual(storedEquipments);
    });

    it('should get the equipments offline as well', async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));

      // Act
      const equipments = await equipmentProxy.fetchEquipments();

      // Assert
      expect(equipments.length).toEqual(0);
    });
  });

  describe('createOrSaveEquipment', () => {
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
        onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

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

        expect(actionManager.countAction()).toBe(arg.expectedNbAction);
      });
    });

    it('should throw an exception HTTPError with the correct data when we try to create an equipment with the same name', async () => {
      // Arrange
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(false));
      await equipmentProxy.createOrSaveEquipment(equipmentToSave);

      try {
        // Act
        await equipmentProxy.createOrSaveEquipment({ ...equipmentToSave, _uiId: 'another_uiId' });
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(HttpError);
        expect(error.data).toEqual({ name: 'alreadyexisting' });
      }
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
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      const savedEquipment = await equipmentProxy.createOrSaveEquipment(equipmentToSave);

      let deleteCounter = 0;
      httpProxy.deleteReq.mockImplementation(() => {
        deleteCounter++;
        return Promise.resolve({ equipment: savedEquipment });
      });

      // Act
      const equipmentDeleted = await equipmentProxy.deleteEquipment(equipmentToSave._uiId);

      // Assert
      expect(deleteCounter).toBe(arg.expectedDeleteCounter);
      expect(equipmentDeleted).toEqual(equipmentToSave);

      const equipments = await storageService.getItem(urlFetchEquipment);
      expect(equipments.length).toBe(arg.expectedNbEquipment);

      expect(actionManager.countAction()).toBe(arg.expectedNbAction);
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
      onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(arg.isOnline));

      let getCounter = 0;
      httpProxy.get.mockImplementation(async (url) => {
        if (url === urlFetchEquipment) {
          getCounter++;
        }

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

  describe('When the user credentials are not enough', () => {
    beforeEach(async () => {
      userProxy.getCredentials.mockImplementation(async () => Promise.resolve({ readonly: true }));

      const user = { email: 'test@gmail.com' };
      await storageService.openUserStorage(user);

      await assetManager.setCurrentAsset({
        _uiId: 'asset_01', name: 'Arbutus', brand: 'Aluminum & Technics', modelBrand: 'Heliotrope', manufactureDate: new Date(1979, 1, 1),
      });
    });

    describe.each(onlineModes)('createOrSaveEquipment', ({ isOnline }) => {
      it(`when ${JSON.stringify({ isOnline })}`, async () => {
        // Arrange
        onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

        let postCounter = 0;
        httpProxy.post.mockImplementation((url, data) => {
          postCounter++;
          return Promise.resolve(data);
        });

        // Act
        try {
          await equipmentProxy.createOrSaveEquipment(equipmentToSave);
        } catch (error) {
          // Assert
          expect(error instanceof HttpError).toBe(true);
          expect(error.data).toEqual({ message: 'credentialError' });

          expect(postCounter).toBe(0);

          const equipments = await storageService.getArray(urlFetchEquipment);
          expect(equipments.length).toBe(0);
          expect(actionManager.countAction()).toBe(0);
          return;
        }
        expect(true).toBeFalsy();
      });
    });

    describe.each(onlineModes)('deleteEquipment', ({ isOnline }) => {
      it(`when ${JSON.stringify({ isOnline })}`, async () => {
        // Arrange
        onlineManager.isOnlineAndSynced.mockImplementation(() => Promise.resolve(isOnline));

        httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));

        let deleteCounter = 0;
        httpProxy.deleteReq.mockImplementation(() => {
          deleteCounter++;
          return Promise.resolve({ });
        });

        // Act
        try {
          await equipmentProxy.deleteEquipment(equipmentToSave._uiId);
        } catch (error) {
          // Assert
          expect(error instanceof HttpError).toBe(true);
          expect(error.data).toEqual({ message: 'credentialError' });

          expect(deleteCounter).toBe(0);
          expect(actionManager.countAction()).toBe(0);
        }
      });
    });
  });

  describe('OnAssetDeleted', () => {
    it('Should delete all the equipments related to this asset', async () => {
      // Arrange
      httpProxy.deleteReq.mockImplementation(async () => Promise.resolve({}));
      jest.spyOn(entryProxy, 'onEquipmentDeleted');
      jest.spyOn(taskProxy, 'onEquipmentDeleted');
      jest.spyOn(imageProxy, 'onEntityDeleted');

      httpProxy.post.mockImplementation((url, data) => Promise.resolve(data));
      await equipmentProxy.createOrSaveEquipment(equipmentToSave);
      await equipmentProxy.createOrSaveEquipment({ ...equipmentToSave, _uiId: 'another id generated by the front', name: 'another name please' });

      // Act
      await equipmentProxy.onAssetDeleted('asset_01');

      // Assert
      expect(httpProxy.deleteReq).toHaveBeenCalledTimes(0);
      expect(entryProxy.onEquipmentDeleted).toHaveBeenCalledTimes(2);
      expect(taskProxy.onEquipmentDeleted).toHaveBeenCalledTimes(2);
      expect(imageProxy.onEntityDeleted).toHaveBeenCalledTimes(2);

      const equipments = await storageService.getArray(urlFetchEquipment);
      expect(equipments.length).toEqual(0);
    });
  });
});
