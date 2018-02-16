require('dotenv').config();

import { Account } from '@wireapp/core';
import { PayloadBundle } from '@wireapp/core/dist/commonjs/crypto/';
import { LoginData } from '@wireapp/api-client/dist/commonjs/auth/';
import ScrabbleCheater from 'scrabble-cheater';

const account = new Account();

const BOT_IDS = ['c48d3a2a-bc15-45ab-902a-5dad253b0191', '211a1a4e-7128-4502-a604-4e5bac2a73b2'];

['WIRE_EMAIL', 'WIRE_PASSWORD'].forEach(env => {
  if (!process.env[env]) {
    console.error(`Error: process.env.${env} not set!`);
    process.exit(1);
  }
});

const login: LoginData = {
  email: String(process.env.WIRE_EMAIL),
  password: String(process.env.WIRE_PASSWORD),
  persist: false,
};

const sc: ScrabbleCheater = new ScrabbleCheater('sowpods.txt', '', false, 50);

account.on(Account.INCOMING.TEXT_MESSAGE, (data: PayloadBundle) => {
  if (BOT_IDS.includes(data.from)) {
    if (data.content.indexOf('Your letters') > -1) {
      const start = data.content.indexOf('\n');
      if (start > 0) {
        const letters = data.content.substr(start + 1);
        sc
          .setLetters(letters)
          .then((sc: ScrabbleCheater) => sc.start())
          .then((words: string[]) => {
            console.log(`Found "${words.length}" words.`);
            words.forEach((word) => account.service.conversation.sendTextMessage(data.conversation, '' + word));
          });
      }
    }
  }
});

account.listen(login).catch((error: Error) => {
  console.error(error.stack, error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  process.exit(1)
});
