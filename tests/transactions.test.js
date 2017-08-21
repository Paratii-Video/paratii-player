/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */
import { resetDb, clearLocalStorage } from './helpers.js';


describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/');
    server.execute(resetDb);
  });

  afterEach(function () {
    browser.execute(clearLocalStorage);
  });

  it('check if page works', function () {
    browser.url('http://localhost:3000/transactions');
    // we should see the login form, we click on the register link
  });
});
