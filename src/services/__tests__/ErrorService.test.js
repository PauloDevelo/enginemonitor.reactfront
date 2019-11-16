import errorService from '../ErrorService';

describe('error service', () => {
  it('When we subscribe to error list changed, we should be notified when an error happens', () => {
    // Arrange
    const onErrorListChanged1 = jest.fn();
    const onErrorListChanged2 = jest.fn();
    errorService.registerOnListErrorChanged(onErrorListChanged1);
    errorService.registerOnListErrorChanged(onErrorListChanged2);
    const error = new Error('something wrong happened');

    // Act
    errorService.addError(error);

    // Assert
    expect(onErrorListChanged1).toBeCalledTimes(1);
    expect(onErrorListChanged2).toBeCalledTimes(1);

    errorService.removeError(error);
  });

  it('When we unsubscribe to error list changed, we should be notified when an error happens', () => {
    // Arrange
    const onErrorListChanged1 = jest.fn();
    const onErrorListChanged2 = jest.fn();
    errorService.registerOnListErrorChanged(onErrorListChanged1);
    errorService.registerOnListErrorChanged(onErrorListChanged2);

    const error1 = new Error('something wrong happened');
    errorService.addError(error1);

    // Act
    errorService.unregisterOnListErrorChanged(onErrorListChanged2);

    const error2 = new Error('something wrong happened');
    errorService.addError(error2);

    // Assert
    expect(onErrorListChanged1).toBeCalledTimes(2);
    expect(onErrorListChanged2).toBeCalledTimes(1);

    errorService.removeError(error1);
    errorService.removeError(error2);
  });

  it('When we remove an error we should be notified as well', () => {
    // Arrange
    let lastErrors = [];
    const onErrorListChanged1 = jest.fn().mockImplementation((errors) => { lastErrors = errors; });
    const onErrorListChanged2 = jest.fn();
    errorService.registerOnListErrorChanged(onErrorListChanged1);
    errorService.registerOnListErrorChanged(onErrorListChanged2);

    const error = new Error('something wrong happened');
    errorService.addError(error);

    errorService.unregisterOnListErrorChanged(onErrorListChanged2);

    // Act
    errorService.removeError(error);

    // Assert
    expect(onErrorListChanged1).toBeCalledTimes(2);
    expect(onErrorListChanged2).toBeCalledTimes(1);
    expect(lastErrors.length).toBe(0);
  });
});
