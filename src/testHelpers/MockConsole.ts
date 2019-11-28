/* istanbul ignore file */
/* eslint-env jest */
/* eslint-disable no-console */
const ignoredMessages:string[] = [
];

const mockConsoleMethod = (realConsoleMethod: (message?: any, ...args: any[])=> void) => (message?: any, ...args: any[]) => {
  const containsIgnoredMessage = ignoredMessages.some((ignoredMessage) => message.toString().includes(ignoredMessage));

  if (!containsIgnoredMessage) {
    realConsoleMethod(message, ...args);
  }
};

// Suppress console errors and warnings to avoid polluting output in tests.
console.warn = jest.fn(mockConsoleMethod(console.warn));
console.log = jest.fn(mockConsoleMethod(console.log));
console.info = jest.fn(mockConsoleMethod(console.info));
console.error = jest.fn(mockConsoleMethod(console.error));

export default ignoredMessages;
