/* eslint global-require: "off" */
// import { assert } from 'chai';
import { resetDb, createUserAndLogin, getSomeEth, getSomePTI, deployContract } from './helpers.js';

describe('wallet', function () {
  beforeEach(function () {
    server.execute(resetDb);
  });

  afterEach(function () {

  });

  it('should be able to send some ETH', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#public_address', 3000);
    browser.execute(getSomeEth, 1);
    browser.waitForExist('#eth_amount', 10000);
    const amount = browser.getHTML('#eth_amount', false);
    assert.equal(amount, 1);
  });

  it('should be able to send some PTI', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#public_address', 3000);
    browser.execute(deployContract);
    browser.click('a[href="#pti"]');
    browser.pause(3000);
    browser.execute(getSomePTI, 1);
    browser.pause(3000);
    browser.waitForExist('#pti_amount');
    const amount = browser.getHTML('#pti_amount', false);
    assert.equal(amount, 1);
  });
});
