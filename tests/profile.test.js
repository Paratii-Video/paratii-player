/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */
import { createUser, resetDb, createKeystore, createUserAndLogin, clearLocalStorage } from './helpers.js';


describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/');
    server.execute(resetDb);
  });

  afterEach(function () {
    browser.execute(clearLocalStorage);
  });

  it('register a new user', function () {
    browser.url('http://localhost:3000/profile');
    // we should see the login form, we click on the register link
    browser.waitForExist('#at-signUp');
    browser.$('#at-signUp').click();

    // fill in the form
    browser.waitForExist('[name="at-field-name"]');
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      .setValue('[name="at-field-password_again"]', 'password');
    // submit the form
    browser.$('#at-btn').click();

    // now a modal should be opened with the seed
    // (we wait a long time, because the wallet needs to be generated)
    browser.waitForVisible('#seed', 10000);
    browser.waitForVisible('#btn-eth-close');
    browser.click('#btn-eth-close');
    // we now should see avatar on the profile page
    // (which is a bi of a hacky way to check if the use is logged in)
    browser.waitForExist('#avatar');
    // we should also see the wallet part
    browser.waitForExist('.walletContainer');
  });

  it('login as an existing user', function () {
    server.execute(createUser);
    // login
    browser.url('http://localhost:3000/profile');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password');

    browser.click('#at-btn');
    browser.execute(createKeystore);
    // we now should see avatar on the profile page
    // (which is a bi of a hacky way to check if the use is logged in)
    browser.waitForExist('#avatar');
    // we should also see the wallet part
    browser.waitForExist('.walletContainer');
  });

  it('shows the seed', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#show-seed', 5000);
    browser.click('#show-seed');
    browser.waitForVisible('[name="user_password"]');
    browser.setValue('[name="user_password"]', 'password');
    browser.click('#btn-show-seed');
    browser.waitForVisible('#btn-eth-close');
    browser.click('#btn-eth-close');
  });


  it('restore the keystore', function () {
    createUserAndLogin(browser);
    browser.waitForExist('#show-seed', 5000);
    browser.click('#show-seed');
    browser.waitForVisible('[name="user_password"]');
    browser.setValue('[name="user_password"]', 'password');
    browser.click('#btn-show-seed');
    browser.pause(1000);
    browser.waitForVisible('#seed');
    const seed = browser.getHTML('#seed tt', false);
    const publicAddress = browser.getHTML('#public_address', false);
    browser.click('#btn-eth-close');
    browser.execute(clearLocalStorage);
    browser.refresh();
    browser.waitForVisible('#restore-keystore');
    browser.click('#restore-keystore');
    browser.waitForVisible('[name="field-seed"]');
    browser.setValue('[name="field-seed"]', seed);
    browser.setValue('[name="field-password"]', 'password');
    browser.click('#btn-restorekeystore-restore');
    browser.waitForExist('#public_address', 3000);
    const newPublicAddress = browser.getHTML('#public_address', false);
    assert.equal(publicAddress, newPublicAddress);
  });
});
