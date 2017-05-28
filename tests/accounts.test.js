// import { assert } from 'chai';

function resetDb() {
  Meteor.users.remove({ 'profile.name': 'Guildenstern' });
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
  });
  it('register a new user @watch', function () {
    browser.url('http://localhost:3000/account');
    // we should see the login form, we click on the register link
    browser.waitForExist('#at-signUp');
    browser.$('#at-signUp').click();

    // fill in the form and submit it
    browser.waitForExist('[name="at-field-name"]');
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password')
      .setValue('[name="at-field-password_again"]', 'a-common-password')
      .submitForm('form');

    // we now should see the model dialog
    // browser.waitForExist('#show-seed');
    // assert.equal(browser.getUrl(), 'ldskjl');
    // assert.equal(browser.$('[name="field-name"]').getValue(), 'guildenstern@rosencrantz.com')
    // assert.equal(browser.$('[name="field-email"]').getValue(), 'guildenstern@rosencrantz.com')
  });
});
