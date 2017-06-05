import { assert } from 'chai';

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

function logOut() {
  // gives "Meteor logout is not a function error. Why?"
  // Meteor.logout();
}

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000');
    server.execute(resetDb);
  });

  afterEach(function () {
    server.execute(logOut);
    // server.execute(resetDb);
  });
  it('register a new user', function () {
    browser.url('http://localhost:3000/account');
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

    // we now find ourselves on the user profile form
    browser.waitForExist('[name="field-name"]', 2000);
    browser.execute('Modal.hide()');

    assert.equal(browser.$('[name="field-name"]').getValue(), 'Guildenstern');
    assert.equal(browser.$('[name="field-email"]').getValue(), 'guildenstern@rosencrantz.com');
  });

  it('login as an existing user', function () {
    server.execute(createUser);
    browser.url('http://localhost:3000/account');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
  });

  it('create wallet ad hoc', function () {
    server.execute(createUser);
    browser.url('http://localhost:3000/wallet');
    browser.waitForExist('#signin-link');
    browser.click('#signin-link');
    browser.waitForExist('[name="at-field-email"]');
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

    browser.click('#at-btn');
    // we are now logged in
    // we are at the wallet page, but given that our user has no account yet
    // we are presented with an invitation to create an account
    browser.waitForExist('#create-wallet', 2000);
    browser.click('#create-wallet');
    // we should now see an alert that asks us to enter a password
    browser.waitUntil(browser.alertText);
    browser.alertText('a-common-password');
    browser.alertAccept();

    // the password is valid, and we should be presented with a mdoal dialog
    // showing the mnemonic phrase
    browser.waitForExist('#show-seed', 2000);
    // close the modal
    browser.execute('Modal.hide()');
    // we are now at the wallet page, and have an address
    browser.waitForExist('#wallet-title');
  });
});
