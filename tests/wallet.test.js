/* eslint global-require: "off" */
// import { assert } from 'chai';
import { login, createUser, resetDb, createKeystore, createUserAndLogin } from './helpers.js';

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000');
    server.execute(resetDb);
  });

  afterEach(function () {
    // server.execute(logOut);
    // server.execute(resetDb);
  });

  it('send some paratii', function () {
    createUserAndLogin();
    // brow
    browser.url('http://localhost:3000/profile');
  });
});
