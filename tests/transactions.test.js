/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */
import { sendParatii } from '/imports/lib/ethereum/wallet.js';
import { resetDb, clearLocalStorage } from './helpers.js';

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/');
    server.execute(resetDb);
  });

  afterEach(function () {
    browser.execute(clearLocalStorage);
  });

  it('check if page works @watch', function () {
    // do some transactions
    browser.execute(function () { sendParatii(1, web3.accounts[1], 'password'); });
    browser.url('http://localhost:3000/transactions');
    // we should see the login form, we click on the register link
  });
});
