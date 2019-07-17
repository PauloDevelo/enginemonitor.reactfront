import httpProxy from '../HttpProxy';
import storageService from '../StorageService';
import actionManager from '../ActionManager';

jest.mock('../HttpProxy');
jest.mock('../SyncService');

describe('Test ActionManager', () => {
    
    function mockHttpProxy(){
        httpProxy.setConfig.mockReset();
        httpProxy.post.mockReset();
        httpProxy.deleteReq.mockReset();
    }

    function initStorage(){
        var user = { email: "test@gmail.com" };
        storageService.openUserStorage(user);
    }

    async function clearStorage(){
        await actionManager.clearActions();
    }

    beforeEach(() => {
        mockHttpProxy();
        initStorage();
    });

    afterEach(async() => {
        clearStorage();
    });

    describe('addAction', () => {
        it("when adding 2 actions, we should get 2 actions in the action list.", async() => {
            // Arrange
            const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: undefined
            }

            const actionToAdd2 = {
                type: 0,
                key: "my_action_test_02",
                data: undefined
            }

            // Act
            await actionManager.addAction(actionToAdd1);
            await actionManager.addAction(actionToAdd2);
            
            // Assert
            const actions = await storageService.getArray("history");
            expect(actions.length).toBe(2);
            expect(actions[0]).toEqual(actionToAdd1);
            expect(actions[1]).toEqual(actionToAdd2);
        });
    });

    describe('getNextActionToPerform', () => {
        it("When adding 2 actions, getNextActionToPerform should return the first added action. Only the last action should remain in the action list.", async() => {
             // Arrange
             const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: undefined
            }

            const actionToAdd2 = {
                type: 0,
                key: "my_action_test_02",
                data: undefined
            }
            await actionManager.addAction(actionToAdd1);
            await actionManager.addAction(actionToAdd2);

            // Act
            const nextAction = await actionManager.getNextActionToPerform();
            
            // Assert
            expect(nextAction).toEqual(actionToAdd1);

            const actions = await storageService.getArray("history");
            expect(actions.length).toBe(1);
            expect(actions[0]).toEqual(actionToAdd2);
        });

        it("When there is no action to perform, getNextActionToPerform should throw an exception.", async() => {
            try{
                await actionManager.getNextActionToPerform();
                expect(true).toBe(false);
            }
            catch(ex){
                expect(ex).toBeInstanceOf(Error);
                expect(ex.message).toEqual("There isn't pending action anymore");
            }
        });
    });

    describe('putBackAction', () => {
        it("Should put an action in the back of the array", async() => {
            // Arrange
            const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: undefined
            }

            const actionToAdd2 = {
                type: 0,
                key: "my_action_test_02",
                data: undefined
            }
            await actionManager.addAction(actionToAdd1);
            await actionManager.addAction(actionToAdd2);
            const nextAction = await actionManager.getNextActionToPerform();

            // Act
            await actionManager.putBackAction(nextAction);
            
            // Assert
            const actions = await storageService.getArray("history");
            expect(actions.length).toBe(2);
            expect(actions[0]).toEqual(actionToAdd1);
            expect(actions[1]).toEqual(actionToAdd2);
        });

        it("Should put an action in the back of the array", async() => {
            // Arrange
            const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: undefined
            }

            await actionManager.addAction(actionToAdd1);
            const nextAction = await actionManager.getNextActionToPerform();

            // Act
            await actionManager.putBackAction(nextAction);
            
            // Assert
            const actions = await storageService.getArray("history");
            expect(actions.length).toBe(1);
            expect(actions[0]).toEqual(actionToAdd1);
        });
    });

    describe('countAction', () => {
        it("when there is no action should return 0", async() => {
            // Arrange
            
            // Act
            const nbAction = await actionManager.countAction();
            
            // Assert
            expect(nbAction).toBe(0);
        });

        it("when there are 2 actions should return 2", async() => {
            // Arrange
            const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: undefined
            }

            const actionToAdd2 = {
                type: 0,
                key: "my_action_test_02",
                data: undefined
            }

            await actionManager.addAction(actionToAdd1);
            await actionManager.addAction(actionToAdd2);
            
            // Act
            const nbAction = await actionManager.countAction();
            
            // Assert
            expect(nbAction).toBe(2);
        });
    });

    describe('performAction', () => {
        it("when performing a post action, it should call the httpProxy.post function with the correct params", async() => {
            // Arrange
            let urls = [];
            let datas = []
            httpProxy.post.mockImplementation((url, data) => {
                urls.push(url);
                datas.push(data);
                return Promise.resolve(data);
            });

            let deleteUrls = [];
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteUrls.push(url);
                return Promise.resolve({ entry: { name: "an entry name" } });
            });

            const actionToAdd1 = {
                type: 0,
                key: "my_action_test_01",
                data: { name: "data1" }
            }

            // Act
            await actionManager.performAction(actionToAdd1);
            
            // Assert
            expect(urls.length).toBe(1);
            expect(urls[0]).toBe(actionToAdd1.key);
            expect(datas[0]).toEqual(actionToAdd1.data);
            expect(deleteUrls.length).toBe(0);
        });

        it("when performing a delete action, it should call the httpProxy.delete function with the correct params", async() => {
            // Arrange
            let urls = [];
            let datas = []
            httpProxy.post.mockImplementation((url, data) => {
                urls.push(url);
                datas.push(data);
                return Promise.resolve(data);
            });

            let deleteUrls = [];
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteUrls.push(url);
                return Promise.resolve({ entry: { name: "an entry name" } });
            });

            const actionToAdd1 = {
                type: 1,
                key: "my_action_test_01",
                data: { name: "data1" }
            }

            // Act
            await actionManager.performAction(actionToAdd1);
            
            // Assert
            expect(urls.length).toBe(0);
            expect(deleteUrls.length).toBe(1);
            expect(deleteUrls[0]).toBe(actionToAdd1.key);
        });

        it("when performing a unknown action, it should not call any httpProxy function but throw an exception", async() => {
            // Arrange
            let urls = [];
            let datas = []
            httpProxy.post.mockImplementation((url, data) => {
                urls.push(url);
                datas.push(data);
                return Promise.resolve(data);
            });

            let deleteUrls = [];
            httpProxy.deleteReq.mockImplementation((url) => {
                deleteUrls.push(url);
                return Promise.resolve({ entry: { name: "an entry name" } });
            });

            const actionToAdd1 = {
                type: 2,
                key: "my_action_test_01",
                data: { name: "data1" }
            }

            // Act
            try{
                await actionManager.performAction(actionToAdd1);
                expect(true).toBe(false);
            }
            catch(error){
                 // Assert
                expect(urls.length).toBe(0);
                expect(deleteUrls.length).toBe(0);
                expect(error.message).toBe("The action type 2 is not recognized.")
            }
        });
    });
});