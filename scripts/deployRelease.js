const options = require('./deployOptions');
const Deployer = require('ssh-deploy-release');

const deployer = new Deployer(options);
deployer.deployRelease(() => {
    console.log('Ok !')
});