const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'build', 'service-worker.js');

if (!fs.existsSync(swPath)) {
    console.error('patchServiceWorker: build/service-worker.js not found, run a build first');
    process.exit(1);
}

const content = fs.readFileSync(swPath, 'utf8');
const apiPattern = '/^\\/api\\//';

if (content.includes(apiPattern)) {
    console.log('patchServiceWorker: /api/ blacklist entry already present, nothing to do');
    process.exit(0);
}

const blacklistPattern = /blacklist:\s*\[/;
if (!blacklistPattern.test(content)) {
    console.error('patchServiceWorker: navigation route blacklist not found in service-worker.js, react-scripts output may have changed');
    process.exit(1);
}

const patched = content.replace(blacklistPattern, 'blacklist: [' + apiPattern + ', ');

if (!patched.includes(apiPattern)) {
    console.error('patchServiceWorker: failed to patch service-worker.js');
    process.exit(1);
}

fs.writeFileSync(swPath, patched);
console.log('patchServiceWorker: added ' + apiPattern + ' to the navigation route blacklist');
