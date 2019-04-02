import mockAxios from "axios";
import {EquipmentMonitorServiceProxy} from '../EquipmentMonitorServiceProxy';

jest.mock('axios');

describe('Test EquipmentMonitorServiceProxy', () => {
    beforeEach(() => {
        localStorage.clear();
        mockAxios.get.mockReset();
        mockAxios.post.mockReset();
    });

    it('Test urlBaseApi', () => {
        const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

        expect(EquipmentMonitorServiceProxyInstance.baseUrl).toBe('http://test/api/');
    });

    describe('USER', () => {
        describe('fetchCurrentUser', () => {
            it("when the user is authenticated in localStorage, it should return the user by calling the server", async () => {
                // setup
                const config = { headers: { Authorization: 'Token jwttoken' }};
                localStorage.setItem('EquipmentMonitorServiceProxy.config', JSON.stringify(config));

                const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

                const user = {
                    email: 'test@axios',
                    firstname: 'jest',
                    name: 'react',
                    token: 'jwt',
                };
        
                mockAxios.get.mockImplementationOnce(() =>
                    Promise.resolve({
                        data: {
                            user: user
                        }
                    })
                );
              
                // work
                const fetchedUser = await EquipmentMonitorServiceProxyInstance.fetchCurrentUser();
              
                // expect
                expect(fetchedUser).toEqual(user);
                expect(mockAxios.get).toHaveBeenCalledTimes(1);
            });

            it("when there the user is not authenticated, it should return undefined and it should not call the server", async () => {
                // setup
                const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

                const user = {
                    email: 'test@axios',
                    firstname: 'jest',
                    name: 'react',
                    token: 'jwt',
                };
        
                mockAxios.get.mockImplementationOnce(() =>
                    Promise.resolve({
                        data: {
                            user: user
                        }
                    })
                );
              
                // work
                const fetchedUser = await EquipmentMonitorServiceProxyInstance.fetchCurrentUser();
              
                // expect
                expect(fetchedUser).toEqual(undefined);
                expect(mockAxios.get).toHaveBeenCalledTimes(0);
            });
        });

        describe('authenticate', () => {
            it("should call logout", () => {
                // Arrange
                const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

                const mockLogout = jest.fn(EquipmentMonitorServiceProxyInstance.logout);
                EquipmentMonitorServiceProxyInstance.logout = mockLogout;

                const authInfo = { email: "test@jest", password: "passwordTest" };

                // Act
                EquipmentMonitorServiceProxyInstance.authenticate(authInfo);

                // Assert
                expect(mockLogout).toHaveBeenCalledTimes(1);
            });

            it("should post the authentification and update the local storage because of the remember flag", async() => {
                // Arrange
                const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

                const user = {
                    email: 'test@jest',
                    firstname: 'jest',
                    name: 'react',
                    token: 'jwt'
                };

                mockAxios.post.mockImplementationOnce(() =>
                    Promise.resolve({
                        data: { user: user }
                    })
                );

                const authInfo = { email: "test@jest", password: "passwordTest", remember: true };

                // Act
                const authUser = await EquipmentMonitorServiceProxyInstance.authenticate(authInfo);

                // Assert
                expect(mockAxios.post).toHaveBeenCalledTimes(1);
                expect(mockAxios.post).toHaveBeenCalledWith("http://test/api/users/login", { user: authInfo }, undefined);

                expect(authUser).toBe(user);

                expect(localStorage.getItem("EquipmentMonitorServiceProxy.config")).toBe(JSON.stringify({ headers: { Authorization: 'Token ' + user.token }}));
            });

            it("should not update the local storage because of the remember flag at false", async() => {
                // Arrange
                const EquipmentMonitorServiceProxyInstance = new EquipmentMonitorServiceProxy();

                const user = {
                    email: 'test@jest',
                    firstname: 'jest',
                    name: 'react',
                    token: 'jwt'
                };
        
                mockAxios.post.mockImplementationOnce(() =>
                    Promise.resolve({
                        data: { user: user }
                    })
                );

                const authInfo = { email: "test@jest", password: "passwordTest", remember: false };

                // Act
                const authUser = await EquipmentMonitorServiceProxyInstance.authenticate(authInfo);

                // Assert
                expect(mockAxios.post).toHaveBeenCalledTimes(1);
                expect(mockAxios.post).toHaveBeenCalledWith("http://test/api/users/login", { user: authInfo }, undefined);

                expect(authUser).toBe(user);

                expect(localStorage.getItem("EquipmentMonitorServiceProxy.config")).toBe('{}');
            });
        });
    });
});



