/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */


function resetDb() {
  Meteor.users.remove({ 'profile.name': 'Guildenstern' });
  Meteor.users.remove({ 'emails.address': 'guildenstern@rosencrantz.com' });
}

function createUser() {
  Accounts.createUser({
    email: 'guildenstern@rosencrantz.com',
    password: 'a-common-password',
  });
}

function clearLocalStorage() {
  localStorage.clear();
}

function createKeystoreHelper() {
  const wallet = require('./imports/lib/ethereum/wallet.js');
  return wallet.createKeystore('a-common-password');
}

describe('account workflow', function () {
  beforeEach(function () {
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
      .setValue('[name="at-field-password"]', 'a-common-password')
      .setValue('[name="at-field-password_again"]', 'a-common-password');
    // submit the form
    browser.$('#at-btn').click();
    // now a modal should be opend with the seed
    // (we wait a long time, because the wallet needs to be generated)
    browser.waitForVisible('#seed', 10000);
  });

  it('login as an existing user', function () {
    server.execute(createUser);
    browser.execute(createKeystoreHelper);

    browser.url('http://localhost:3000/profile');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
  });

  it('restore the keystore', function () {
    server.execute(createUser);
    const session = browser.execute(createKeystoreHelper);
    const seedPhrase = session.value.seed;

    // now log in
    browser.url('http://localhost:3000/profile');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
    // we are now logged in
    // we are at the wallet page, and try to restore the account
    browser.waitForExist('#restore-keystore', 20000);
    browser.click('#restore-keystore');
    browser.waitForVisible('[name="field-seed"]', 2000);
    browser
      .setValue('[name="field-seed"]', seedPhrase)
      .setValue('[name="field-password"]', 'a-common-password');
    browser.click('#btn-restorekeystore-restore');
    // TODO: check if it was indeed restored...
  });
});
