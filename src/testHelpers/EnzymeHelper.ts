import ReactWrapper from 'enzyme';

const updateWrapper = (wrapper: ReactWrapper): Promise<void> => {
    return new Promise((resolve, reject) => {
        Promise.resolve(wrapper) .then(() => {
            wrapper.update();
            resolve();
        });
    });
}

export default updateWrapper;