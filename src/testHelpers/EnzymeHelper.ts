const updateWrapper = (wrapper: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        Promise.resolve(wrapper) .then(() => {
            wrapper.update();
            resolve();
        });
    });
}

export default updateWrapper;