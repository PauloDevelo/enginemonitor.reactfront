const updateWrapper = (wrapper: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        Promise.resolve(wrapper).then(() => {
            setTimeout(() => wrapper.update(), 10);
            setTimeout(resolve, 20);
        });
    });
}

export default updateWrapper;