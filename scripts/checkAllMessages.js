
const chalk = require('chalk');
const translation_fr = require("../src/translations/fr.json");
const translation_en = require("../src/translations/en.json");

const translations = {
    'fr': translation_fr,
    'en': translation_en
};

try{
    var recursive = require("recursive-readdir");
    
    function ignoreFunc(file, stats) {
        return stats.isDirectory() === false && file.endsWith(".messages.json") === false;
    }

    let nbError = 0;
        
    recursive("src", [ignoreFunc], function (err, files) {
        files.forEach((messagesFile) => {
            const messagesModule = require("../" + messagesFile);
            console.log(chalk.white(messagesFile + " -> "));
            let containError = false;

            for(const messageKey in messagesModule){
                const message = messagesModule[messageKey];

                for(const translationKey in translations){
                    if(translations[translationKey][message.id] === undefined){
                        nbError++;
                        containError = true;
                        console.error(chalk.red("[" + messageKey + '] id "' + message.id + '" is missing in the ' + translationKey + " translation"));
                    }
                }
            }

            if(containError === false){
                console.log(chalk.green("OK"));
            }
            console.log();
        });
    });

    if (nbError > 0){
        process.exit(nbError);
    }
}
catch(err){
    console(err);
    process.exit(1);
}
