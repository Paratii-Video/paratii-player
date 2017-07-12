/* eslint global-require: "off" */
// import { assert } from 'chai';


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
function createKeystoreHelper() {
  const wallet = require('./imports/lib/ethereum/wallet.js');
  return wallet.createKeystore('a-common-password');
}

function login(browser) {
  browser.url('http://localhost:3000/profile');
  browser.waitForExist('[name="at-field-email"]', 2000);
    // browser.click('#signin-link');
  browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password');

  browser.click('#at-btn');
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


  it('send some paratii', function () {
    server.execute(createUser);
    // now log in
    login(browser);
    browser.execute(createKeystoreHelper);
    // brow
    browser.url('http://localhost:3000/profile');
  });
});
