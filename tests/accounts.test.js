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

function createWalletHelper() {
  const wallet = require('./imports/lib/ethereum/wallet.js');
  return wallet.createWallet('a-common-password');
}


describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000');
    server.execute(resetDb);
  });

  afterEach(function () {
    // server.execute(logOut);
    // server.execute(resetDb);
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
    browser.execute('Modal.hide()');

    // the user is now asked to create a new wallet or restore a previous one
    // we create a new wallet
    browser.waitForExist('#create-wallet');
    // browser.$('#create-wallet').click();
    // // TODO: continue tot test the wallet generation
    // browser.waitUntil(browser.alertText);
    // browser.alertText('a-common-password');
    // browser.alertAccept();
  });

  it('login as an existing user', function () {
    server.execute(createUser);
    browser.execute(createWalletHelper);

    browser.url('http://localhost:3000/profile');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
  });

  it('create wallet ad hoc', function () {
    server.execute(createUser);
    browser.url('http://localhost:3000/profile');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
    // we are now logged in
    // we are at the wallet page, but given that our user has no account yet
    // we are presented with an invitation to create an account
    browser.waitForExist('#create-wallet', 2000);
    // we should now see an alert that asks us to enter a password

    // TODO: rewrite rest of the test with modals instead of alerts

    // browser.click('#create-wallet');
    // browser.waitUntil(browser.alertText());
    // browser.alertText('a-common-password');
    // browser.alertAccept();

    // // the password is valid, and we should be presented with a mdoal dialog
    // // showing the mnemonic phrase
    // browser.waitForExist('#show-seed', 2000);
    // // close the modal
    // browser.execute('Modal.hide()');
    // // we are now at the wallet page, and have an address
    // browser.waitForExist('#wallet-title');
  });

  it('restore the keystore', function () {
    server.execute(createUser);
    const session = browser.execute(createWalletHelper);
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
    browser.waitForExist('#restore-wallet', 2000);
    browser.click('#restore-wallet');
    browser.waitUntil(browser.alertText);
    browser.alertText(seedPhrase);
    browser.alertAccept();
    browser.waitUntil(browser.alertText);
    browser.alertText('a-common-password');
    browser.alertAccept();
  });
});
