/* eslint global-require: "off" */
// import { assert } from 'chai';
<<<<<<< HEAD
import { resetDb, createUserAndLogin, getSomeEth, getSomePTI } from './helpers.js';
=======
import { resetDb, createUserAndLogin } from './helpers.js';
>>>>>>> a116e82824a521948c1711a401ecda3ccc5180a6

describe('wallet', function () {
  beforeEach(function () {
    server.execute(resetDb);
  });

  afterEach(function () {

  });

  it('should be able to send some ETH', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#public_address', 3000);
    browser.execute(getSomeEth, 50);
    browser.waitForExist('#eth_amount', 5000);
    const amount = browser.getHTML('#eth_amount', false);
    assert.equal(amount, 50);
  });

<<<<<<< HEAD
  it('should be able to send some PTI @watch', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#public_address', 3000);
    browser.execute(getSomePTI);
=======
  it('should be able to send some PTI', function () {
    createUserAndLogin(browser);
    browser.url('http://localhost:3000/profile');
    browser.pause(10000);
>>>>>>> a116e82824a521948c1711a401ecda3ccc5180a6
  });
});
