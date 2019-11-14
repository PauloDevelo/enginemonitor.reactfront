const updateWrapper = (wrapper: any): Promise<void> => new Promise((resolve) => {
  Promise.resolve(wrapper).then(() => {
    setTimeout(() => wrapper.update(), 10);
    setTimeout(resolve, 20);
  });
});

export default updateWrapper;
