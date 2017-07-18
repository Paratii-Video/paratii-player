/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */
import { createUserAndLogin, resetDb, clearLocalStorage } from './helpers.js';

function sendSomeParatiiToUser1() {
  const wallet = require('/imports/lib/ethereum/wallet.js');
  wallet.sendParatii(1, '0xe19678107410951a9ed1f6906ba4c913eb0e44d4', 'password');
}

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/');
    server.execute(resetDb);
  });

  afterEach(function () {
    browser.execute(clearLocalStorage);
  });

  it('check if page shows PTI transactions [TO DO]', function () {
    createUserAndLogin(browser);
    // do some transactions
    // browser.execute(sendSomeParatiiToUser1);
    browser.url('http://localhost:3000/transactions');
    // we should see the login form, we click on the register link
  });
});
