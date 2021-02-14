/* istanbul ignore file */

const updateWrapper = (wrapper: any): Promise<void> => new Promise((resolve) => {
  Promise.resolve(wrapper).then(() => {
    setTimeout(() => wrapper.update(), 10);
    setTimeout(resolve, 20);
  });
});

export function sleep(ms: number) {
  return new Promise((resolve: (param: number) => void) => {
    setTimeout(resolve, ms, ms);
  });
}

export default updateWrapper;
