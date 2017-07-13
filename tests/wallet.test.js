/* eslint global-require: "off" */
// import { assert } from 'chai';
import { login, createUser, resetDb, createKeystore, createUserAndLogin } from './helpers.js';

describe('wallet', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000');
    server.execute(resetDb);
  });

  afterEach(function () {
    // server.execute(logOut);
    // server.execute(resetDb);
  });

  it('should be able to send some PTI', function () {
    createUserAndLogin(browser);
    browser.url('http://localhost:3000/profile');
    browser.pause(10000);
  });
});
