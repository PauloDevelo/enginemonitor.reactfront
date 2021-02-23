import ignoredMessages from '../../testHelpers/MockConsole';
import storageService from '../StorageService';
import storageUpdaterService from '../StorageUpdaterService';

jest.mock('../StorageUpdaterService');

describe('Test StorageService', () => {
  const key = 'a_key';

  function initStorage() {
    jest.spyOn(storageUpdaterService, 'onUserStorageOpened');
    const user = { email: 'test@gmail.com' };
    storageService.openUserStorage(user);
  }

  beforeEach(() => {
    initStorage();
  });

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('undefined used as a key, but it is not a string.');
  });

  afterEach(async () => {
    storageUpdaterService.onUserStorageOpened.mockReset();
  });

  // describe('setGlobalItem', () => {
  //     it("When adding a new global item, should be able to get it after", async() => {
  //         // Arrange
  //         const dataTest = { value:"bonjour de Shenzhen" };

  //         // Act
  //         await storageService.setGlobalItem("testSetGlobalItem", dataTest);

  //         // Assert
  //         const data = await storageService.getGlobalItem("testSetGlobalItem");
  //         expect(data).toEqual(dataTest);
  //     });

  //     it("When adding an existing global item, should override the previous value", async() => {
  //         // Arrange
  //         let dataTest = { value:"bonjour de Shenzhen" };
  //         await storageService.setGlobalItem("testSetGlobalItem", dataTest);
  //         dataTest = { value:"bonjour de Hanoi" };
  //         // Act
  //         await storageService.setGlobalItem("testSetGlobalItem", dataTest);

  //         // Assert
  //         const data = await storageService.getGlobalItem("testSetGlobalItem");
  //         expect(data).toEqual(dataTest);
  //     });

  //     it("When adding an undefined global item, should override the previous value", async() => {
  //         // Arrange
  //         let dataTest = { value:"bonjour de Shenzhen" };
  //         await storageService.setGlobalItem("testSetGlobalItem", dataTest);

  //         // Act
  //         await storageService.setGlobalItem("testSetGlobalItem", undefined);

  //         // Assert
  //         const data = await storageService.getGlobalItem("testSetGlobalItem");
  //         expect(data).toBeUndefined();
  //     });
  // });
  //
  // describe('getGlobalItem', () => {
  //     it("When getting an existing item, we should get a valid item", async() => {
  //         // Arrange
  //         const dataTest = { value:"bonjour de Shenzhen" };
  //         await storageService.setGlobalItem("testSetGlobalItem", dataTest);

  //         // Act
  //         const data = await storageService.getGlobalItem("testSetGlobalItem");

  //         // Assert
  //         expect(data).toEqual(dataTest);
  //     });

  //     it("When getting an non-existing item, we should get a valid item", async() => {
  //         // Arrange

  //         // Act
  //         const data = await storageService.getGlobalItem("unknownKey");

  //         // Assert
  //         expect(data).toBeUndefined();
  //     });
  // });

  describe('openUserStorage', () => {
    it('should call the storageUpdaterService once', () => {
      // Arrange

      // Act

      // Assert
      expect(storageUpdaterService.onUserStorageOpened).toBeCalledTimes(1);
    });
  });

  describe('getItem', () => {
    it('When we try to get an item from an undefined|null key, it should throw an exception', async () => {
      try {
        // Act
        await storageService.getItem(undefined);
      } catch (error) {
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When we get an unknwon item, it should return undefined', async () => {
      // Act
      const data = await storageService.getItem('unknown key');

      // Assert
      expect(data).toBeUndefined();
    });

    it('When we get an existing item, it should return this item', async () => {
      // Arrange
      const data = { value: 'Ni Hao from Shenzhen' };
      await storageService.setItem(key, data);

      // Act
      const storedData = await storageService.getItem(key);

      // Assert
      expect(data).toEqual(storedData);
    });
  });

  describe('setItem', () => {
    it('When we try to set an item from an undefined|null key, it should throw an exception', async () => {
      try {
        // Act
        await storageService.setItem(undefined, 'hello');
      } catch (error) {
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When we set an undefined item, it should erase the item and return undefined', async () => {
      // Act
      const data = await storageService.setItem(key, undefined);

      // Assert
      expect(data).toBeUndefined();

      const storedData = await storageService.getItem(key);
      expect(storedData).toBeUndefined();
    });

    it('When we set a valid item, it should return this item', async () => {
      // Arrange
      const data = { value: 'Ni Hao from Shenzhen' };

      // Act
      const returnedItem = await storageService.setItem(key, data);
      const storedData = await storageService.getItem(key);

      // Assert
      expect(data).toEqual(returnedItem);
      expect(data).toEqual(storedData);
    });

    it('When we set a valid array, it should return this array', async () => {
      // Arrange
      const data1 = { value: 'Ni Hao from Shenzhen' };
      const data2 = { value: 'Bonjour de Paris' };
      const data3 = { value: 'Hello from Auckland' };

      const array = [data1, data2, data3];

      // Act
      const returnedArray = await storageService.setItem(key, array);
      const storedArray = await storageService.getItem(key);

      // Assert
      expect(array).toEqual(returnedArray);
      expect(array).toEqual(storedArray);
    });
  });

  describe('getArray', () => {
    it('When we try to get an array from an undefined|null key, it should throw an exception', async () => {
      try {
        // Act
        await storageService.getArray(undefined);
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When we get an existing array, it should get it', async () => {
      // Arrange
      const data1 = { value: 'Ni Hao from Shenzhen' };
      const data2 = { value: 'Bonjour de Paris' };
      const data3 = { value: 'Hello from Auckland' };

      const array = [data1, data2, data3];
      await storageService.setItem(key, array);

      // Act
      const storedArray = await storageService.getArray(key);

      // Assert
      expect(storedArray).toEqual(array);
    });

    it('When we get an non existing array, it should returned undefined', async () => {
      // Arrange
      await storageService.setItem(key, undefined);

      // Act
      const storedArray = await storageService.getArray(key);

      // Assert
      expect(storedArray).toEqual([]);
    });
  });

  describe('updateArray', () => {
    it('When we try to update an array from an undefined|null key, it should throw an exception', async () => {
      try {
        // Arrange
        const newData = { _uiId: 'uid_data2', name: 'data2', value: 'Good morning from London' };

        // Act
        await storageService.updateArray(undefined, newData);
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When we try to update an array with an undefined element, it should throw an exception', async () => {
      try {
        // Arrange
        const newData = undefined;

        // Act
        await storageService.updateArray(key, newData);
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When updating an array of entity, the element passed in parameter should replace the stored item based on its _uiId', async () => {
      // Arrange
      const data1 = { _uiId: 'uid_data1', name: 'data1', value: 'Ni Hao from Shenzhen' };
      const data2 = { _uiId: 'uid_data2', name: 'data2', value: 'Bonjour de Paris' };
      const data3 = { _uiId: 'uid_data3', name: 'data3', value: 'Hello from Auckland' };

      const array = [data1, data2, data3];
      await storageService.setItem(key, array);

      const newData2 = { _uiId: 'uid_data2', name: 'data2', value: 'Good morning from London' };

      // Act
      await storageService.updateArray(key, newData2);

      // Assert
      const storedArray = await storageService.getArray(key);

      const storedData2 = storedArray.find((i) => i._uiId === newData2._uiId);
      expect(storedData2).toEqual(newData2);
    });

    it('When updating an non existing array of entity, the element passed in parameter should become the first element of this new array', async () => {
      // Arrange
      await storageService.setItem(key, undefined);

      const newData = { _uiId: 'uid_data2', name: 'data2', value: 'Good morning from London' };

      // Act
      await storageService.updateArray(key, newData);

      // Assert
      const storedArray = await storageService.getArray(key);
      expect(storedArray.length).toEqual(1);

      const storedData = storedArray.find((i) => i._uiId === newData._uiId);
      expect(storedData).toEqual(newData);
    });

    it('When updating an array of entity, with a new element passed in parameter, it should be added in the array', async () => {
      // Arrange
      const data1 = { _uiId: 'uid_data1', name: 'data1', value: 'Ni Hao from Shenzhen' };
      const data2 = { _uiId: 'uid_data2', name: 'data2', value: 'Bonjour de Paris' };
      const data3 = { _uiId: 'uid_data3', name: 'data3', value: 'Hello from Auckland' };

      const array = [data1, data2, data3];
      await storageService.setItem(key, array);

      const newData = { _uiId: 'uid_data4', name: 'data4', value: 'Good morning from London' };

      // Act
      await storageService.updateArray(key, newData);

      // Assert
      const storedArray = await storageService.getArray(key);

      const storedData = storedArray.find((i) => i._uiId === newData._uiId);
      expect(storedData).toEqual(newData);
    });
  });

  describe('removeItemInArray', () => {
    it('When we try to remove an item in an array from an undefined|null key, it should throw an exception', async () => {
      try {
        // Arrange

        // Act
        await storageService.removeItemInArray(undefined, 'uid_data2');
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When we try to remove an item in an array with an undefined element, it should throw an exception', async () => {
      try {
        // Arrange

        // Act
        await storageService.removeItemInArray(key, undefined);
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });

    it('When removing an item from an array, it should remove this item in the array', async () => {
      // Arrange
      const data1 = { _uiId: 'uid_data1', name: 'data1', value: 'Ni Hao from Shenzhen' };
      const data2 = { _uiId: 'uid_data2', name: 'data2', value: 'Bonjour de Paris' };
      const data3 = { _uiId: 'uid_data3', name: 'data3', value: 'Hello from Auckland' };

      const array = [data1, data2, data3];
      await storageService.setItem(key, array);

      // Act
      await storageService.removeItemInArray(key, data2._uiId);

      // Assert
      const storedArray = await storageService.getArray(key);

      const storedData2 = storedArray.find((i) => i._uiId === data2._uiId);
      expect(storedData2).toBeUndefined();
    });

    it('When removing an non existing item in an array of entity, it should throw an exception', async () => {
      // Arrange
      const data1 = { _uiId: 'uid_data1', name: 'data1', value: 'Ni Hao from Shenzhen' };
      const data2 = { _uiId: 'uid_data2', name: 'data2', value: 'Bonjour de Paris' };
      const data3 = { _uiId: 'uid_data3', name: 'data3', value: 'Hello from Auckland' };

      const array = [data1, data2, data3];
      await storageService.setItem(key, array);

      try {
        // Act
        await storageService.removeItemInArray(key, 'uid_data4');
      } catch (error) {
        // Assert
        return;
      }
      expect(true).toBeFalsy();
    });
  });
});
