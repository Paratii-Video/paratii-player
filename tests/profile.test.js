import { createUser, resetDb, createUserAndLogin, assertUserIsLoggedIn, assertUserIsNotLoggedIn, nukeLocalStorage, clearUserKeystoreFromLocalStorage, login } from './helpers.js'
import { web3 } from '../imports/lib/ethereum/web3.js'
import { assert } from 'chai'


describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/')
    server.execute(resetDb)
    browser.execute(clearUserKeystoreFromLocalStorage)
  })

  afterEach(function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
  })

  it('register a new user [legacy, siging up with profile page]', function () {
    // this test can be safely removed
    browser.execute(nukeLocalStorage)

    browser.url('http://localhost:3000/profile')

    // TODO: use signup modal to log in
    // we should see the login form, we click on the register link
    browser.waitForEnabled('#at-signUp')
    browser.$('#at-signUp').click()

    // fill in the form
    browser.waitForEnabled('[name="at-field-name"]')
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.$('#at-btn').click()

    // now a modal should be opened with the seed
    // (we wait a long time, because the wallet needs to be generated)
    browser.waitForVisible('#seed', 10000)
    browser.waitForVisible('#btn-eth-close')
    browser.click('#btn-eth-close')

    // the user is now be logged in, and on the profile page, where the avatar is visible
    browser.waitForExist('#avatar', 10000)
    // we should also see the wallet part
    browser.waitForExist('.walletContainer')
  })

  it('register a new user', function () {
    browser.execute(nukeLocalStorage)

    browser.url('http://localhost:3000')

    // log in as the created user
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('#at-signUp')
    browser.click('#at-signUp')

    // fill in the form
    browser.pause(1000)
    // fill in the form
    browser.waitForEnabled('[name="at-field-name"]')
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.$('#at-btn').click()


    // now a modal should be opened with the seed
    // (we wait a long time, because the wallet needs to be generated)
    browser.waitForVisible('#seed', 10000)
    browser.pause(2000)
    browser.waitForVisible('#btn-eth-close')
    browser.click('#btn-eth-close')

    // the user is now be logged in, and on the profile page, where the avatar is visible
    assertUserIsLoggedIn(browser)
  })



  it('login as an existing user on the profile page (legacy test)', function () {
    // XXX: this test can be safely removed once the login form is removed from the profile page
    // TODO: when visiting he profile page if not logged in, the login dialog should be shown
    browser.execute(nukeLocalStorage)

    // create a meteor user
    server.execute(createUser)


    // log in as the created user
    browser.url('http://localhost:3000/profile')

    browser.waitForExist('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')


    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal', 5000)
    browser.pause(1000)
    browser.waitForEnabled('#create-wallet', 5000)

    // TODO: check if wallet is created (is not implemented yet)

    // the user is now be logged in, and on the profile page, where the avatar is visible
    browser.waitForExist('#avatar')
  })

  it('login as an existing user on a device with no keystore - use existing anonymous keystore [TODO: finish this test] @watch', function () {
    browser.execute(nukeLocalStorage)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)
    browser.url('http://localhost:3000')
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')


    // we should now see a modal presenting a choice to restore the wallet or use a new one
    // TODO: the modal does NOT open: why???
    // browser.waitForExist('#walletModal', 5000)
    // browser.pause(1000)
    // browser.waitForEnabled('#create-wallet', 5000)
    // browser.click('#create-wallet')

    // TODO: check if wallet is created (is not implemented yet)

    // the user is now logged in
    browser.pause(1000)
    assertUserIsLoggedIn(browser)
  })

  it('login as an existing user on a device with no keystore - restore keystore with a seedPhrase [TODO: FIX] @watch', function () {

    browser.execute(nukeLocalStorage)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)
    browser.url('http://localhost:3000')
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // TODO: for some reason the regenerateKeystore will not open...
    // // we should now see a modal presenting a choice to restore the wallet or use a new one
    // browser.waitForExist('#walletModal', 5000)
    //
    // // we choose to restore the keystore
    // browser.waitForEnabled('#restore-keystore', 5000)
    // browser.pause(1000)
    // browser.click('#restore-keystore')
    //
    // TODO: we now should see a modal in which we are asked for the seed to regenerate the keystore

    // the user is now logged in
    browser.pause(1000)
    assertUserIsLoggedIn(browser)

  })
  it('login as an existing user on a device with no keystore - restore keystore with a seedPhrase (legacy)', function () {
    // legacy test with login using profile page, can be safely removed
    browser.execute(nukeLocalStorage)

    // create a meteor user
    server.execute(createUser)

    // TODO: use logon modal to log in
    browser.url('http://localhost:3000/profile')
    browser.waitForExist('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal', 5000)
    browser.waitForEnabled('#restore-keystore', 5000)
    browser.pause(1000)
    browser.click('#restore-keystore')

    // TODO: we now should see a modal in which we are asked for the seed to regenerate the keystore

    // the user is now be logged in, and on the profile page, where the avatar is visible
    browser.waitForExist('#avatar')
  })

  it('try to register a new account with a used email', function () {
    server.execute(createUser)
    browser.url('http://localhost:3000/profile')
    // we should see the login form, we click on the register link
    browser.waitForExist('#at-signUp')
    browser.$('#at-signUp').click()

    // fill in the form
    browser.waitForExist('[name="at-field-name"]')
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.$('#at-btn').click()
    browser.waitForVisible('.at-error', 2000)
    const error = browser.getText('.at-error')
    assert.isNotNull(error, 'should exist a error message')
    assert.equal(error, 'Email already exists.')
  })

  it('do not overwrite a user address if failed to register a new user with a used email ', function () {
    createUserAndLogin(browser)
    browser.waitForVisible('#public_address', 5000)
    const address = browser.getText('#public_address')

    // logout
    browser.$('#logout').click()
    browser.url('http://localhost:3000/profile')
    // we should see the login form, we click on the register link
    browser.waitForExist('#at-signUp')
    browser.$('#at-signUp').click()

    // fill in the form
    browser.waitForExist('[name="at-field-name"]', 6000)
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.$('#at-btn').click()

    // verify if the address doesn't changed
    login(browser)
    browser.waitForVisible('#public_address', 5000)
    const address2 = browser.getText('#public_address')
    assert.equal(web3.toChecksumAddress(address), address2, 'The address is not the same')
    browser.pause(5000)
  })

  it('shows the seed', function () {
    createUserAndLogin(browser)

    browser.waitForExist('#show-seed', 5000)
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.waitForVisible('#btn-eth-close')
    browser.click('#btn-eth-close')
  })

  it('sends ether dialog is visible', function () {
    createUserAndLogin(browser)
    //
    browser.waitForExist('#send-eth', 5000)
    browser.click('#send-eth')
    browser.waitForExist('.modal-dialog', 5000)
  })

  it('do not show the seed if wrong password', function () {
    createUserAndLogin(browser)

    browser.waitForEnabled('#show-seed', 5000)
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'wrong')
    browser.click('#btn-show-seed')
    browser.waitForVisible('.control-label', 1000)
    assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('restore the keystore', function () {
    createUserAndLogin(browser)

    browser.pause(2000)

    browser.waitForExist('#show-seed', 5000)
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.pause(1000)
    browser.waitForVisible('#seed')
    const seed = browser.getHTML('#seed tt', false)
    const publicAddress = browser.getHTML('#public_address', false)
    browser.click('#btn-eth-close')

    browser.execute(clearUserKeystoreFromLocalStorage)

    browser.refresh()
    browser.pause(2000)
    // we now have a user account that is known in meteor, but no keystore
    // TODO: in this case, the user is logged in, but has removed his keystore after logging in, the bastard
    // we need to show a blocking modal here
    //
    browser.waitForEnabled('#restore-keystore')
    browser.click('#restore-keystore')
    browser.waitForVisible('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', seed)
    browser.setValue('[name="field-password"]', 'password')
    browser.click('#btn-restorekeystore-restore')
    browser.waitForExist('#public_address', 3000)
    const newPublicAddress = browser.getHTML('#public_address', false)
    assert.equal(publicAddress, newPublicAddress)
  })

  it('do not restore keystore if wrong password', function () {
    createUserAndLogin(browser)

    browser.waitForExist('#show-seed', 5000)
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.pause(1000)
    browser.waitForVisible('#seed')
    const seed = browser.getHTML('#seed tt', false)
    // const publicAddress = browser.getHTML('#public_address', false)
    browser.click('#btn-eth-close')
    browser.execute(clearUserKeystoreFromLocalStorage)
    browser.refresh()

    browser.waitForVisible('#restore-keystore')
    browser.click('#restore-keystore')
    browser.waitForVisible('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', seed)
    browser.setValue('[name="field-password"]', 'wrong')
    browser.click('#btn-restorekeystore-restore')
    browser.waitForVisible('.control-label', 2000)
    assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('do not create a new wallet if the password is wrong', function () {
    createUserAndLogin(browser)
    browser.execute(clearUserKeystoreFromLocalStorage)
    browser.refresh()
    browser.waitForVisible('#create-wallet', 2000)
    browser.click('#create-wallet')
    browser.pause(1000)
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'wrong')
    browser.click('#btn-show-seed')
    browser.waitForVisible('.control-label', 1000)
    assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })
})
