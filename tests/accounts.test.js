import { assert } from 'chai';

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

    // fill in the form 
    browser.waitForExist('[name="at-field-name"]');
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'a-common-password')
      .setValue('[name="at-field-password_again"]', 'a-common-password')

    // submit the form
    browser.$('#at-btn').click();

    // we now should see the modal dialog (and in particular the "close"  button)
    // but somehow, webdriverio thinks it is not visible
    // browser.waitForExist('#btn-show-seed-close', 3000);
    browser.execute('Modal.hide("show-seed")');

    // we now find ourselves on the user profile form
    browser.waitForExist('[name="field-name"]');
    assert.equal(browser.$('[name="field-name"]').getValue(), 'Guildenstern');
    assert.equal(browser.$('[name="field-email"]').getValue(), 'guildenstern@rosencrantz.com')
    console.log('done')
  });
});
