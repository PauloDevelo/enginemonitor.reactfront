try{
    const fs = require('fs');
    const packageJson = require('../package.json');

    const appVersion = packageJson.version;

    const jsonData = {
        version: appVersion
    };

    var jsonContent = JSON.stringify(jsonData);

    fs.writeFile('./public/meta.json', jsonContent, 'utf8', function(err) {
        if (err) {
            console.log('An error occured while writing JSON Object to meta.json');
            console.log(err);
            process.exit(1);
        }

        console.log('meta.json file has been saved with latest version number');
    });
}
catch(err){
    console.log(err);
    process.exit(1);
}