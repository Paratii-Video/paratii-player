/* eslint global-require: "off" */
// import { assert } from 'chai';
import { resetDb } from './helpers.js';

describe('wallet', function () {
  beforeEach(function () {
    server.execute(resetDb);
    browser.url('http://localhost:3000');
  });

  afterEach(function () {
    // server.execute(logOut);
    // server.execute(resetDb);
  });

  // it('should be able to send some PTI', function () {
  //   createUserAndLogin(browser);
  //   browser.url('http://localhost:3000/profile');
  //   browser.pause(10000);
  // });
});
