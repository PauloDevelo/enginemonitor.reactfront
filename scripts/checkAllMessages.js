
const chalk = require('chalk');
const translation_fr = require("../src/translations/fr.json");
const translation_en = require("../src/translations/en.json");

const translations = {
    'fr': translation_fr,
    'en': translation_en
};
const keys = {
    'fr': Object.keys(translation_fr),
    'en': Object.keys(translation_en)
}

function removeKey(keys, key){
    const keyIndex = keys.indexOf(key);
    if (keyIndex !== -1){
        keys.splice(keyIndex, 1);
    }
}

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
                    removeKey(keys[translationKey], message.id);

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

        for(const translationKey in keys){
            nbError += keys[translationKey].length;
            if(keys[translationKey].length === 0){
                console.log(chalk.green("There isn't unused translation in " + translationKey));
            }
            else{
                console.log(chalk.red("List of the unused translation for " + translationKey));
                keys[translationKey].forEach((key) => {
                    console.log(chalk.red(key));
                });
                console.log();
            }
        }
    });

    if (nbError > 0){
        process.exit(nbError);
    }
}
catch(err){
    console(err);
    process.exit(1);
}
