/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable global-require */

const log = require('loglevel');
// eslint-disable-next-line import/no-extraneous-dependencies
const chalk = require('chalk');
// eslint-disable-next-line import/no-extraneous-dependencies
const recursive = require('recursive-readdir');

const translationFr = require('../src/translations/fr.json');
const translationEn = require('../src/translations/en.json');

log.setLevel('trace', false);

const translations = {
  fr: translationFr,
  en: translationEn,
};
const keys = {
  fr: Object.keys(translationFr),
  en: Object.keys(translationEn),
};

function removeKey(keyArray, key) {
  const keyIndex = keyArray.indexOf(key);
  if (keyIndex !== -1) {
    keyArray.splice(keyIndex, 1);
  }
}

function ignoreFunc(file, stats) {
  return stats.isDirectory() === false && file.endsWith('.messages.json') === false;
}

try {
  let nbError = 0;

  recursive('src', [ignoreFunc], (err, files) => {
    files.forEach((messagesFile) => {
      // eslint-disable-next-line import/no-dynamic-require
      const messagesModule = require(`../${messagesFile}`);
      log.info(chalk.white(`${messagesFile} -> `));
      let containError = false;

      for (const messageKey in messagesModule) {
        const message = messagesModule[messageKey];
        for (const translationKey in translations) {
          removeKey(keys[translationKey], message.id);

          if (translations[translationKey][message.id] === undefined) {
            nbError++;
            containError = true;
            log.error(chalk.red(`[${messageKey}] id "${message.id}" is missing in the ${translationKey} translation`));
          }
        }
      }

      if (containError === false) {
        log.info(chalk.green('OK'));
      }
      log.info();
    });

    for (const translationKey in keys) {
      nbError += keys[translationKey].length;
      if (keys[translationKey].length === 0) {
        log.info(chalk.green(`There isn't unused translation in ${translationKey}`));
      } else {
        log.info(chalk.red(`List of the unused translation for ${translationKey}`));
        keys[translationKey].forEach((key) => {
          log.info(chalk.red(key));
        });
        log.info();
      }
    }
  });

  if (nbError > 0) {
    process.exit(nbError);
  }
} catch (err) {
  log.error(err);
  process.exit(1);
}
