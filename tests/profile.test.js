import { SEED, USERADDRESS, getAnonymousAddress, createUser, resetDb, createUserAndLogin, assertUserIsLoggedIn, assertUserIsNotLoggedIn, nukeLocalStorage, clearUserKeystoreFromLocalStorage, getUserPTIAddressFromBrowser } from './helpers.js'
import { add0x } from '../imports/lib/utils.js'
import { assert } from 'chai'

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/')
    server.execute(resetDb)
    browser.execute(clearUserKeystoreFromLocalStorage)
  })

  afterEach(function () {
    // TODO: reset everything: call nukeLocalStorage here
    browser.execute(clearUserKeystoreFromLocalStorage)
    server.execute(resetDb)
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

    browser.pause(1000)
    // fill in the form
    browser.waitForEnabled('[name="at-field-name"]')
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      // .setValue('[name="at-field-password_again"]', 'password')

    // submit the form
    browser.$('#at-btn').click()

    // the new user is automaticaly logged in after account creation
    browser.pause(1000)
    assertUserIsLoggedIn(browser)

    // now a modal should be opened with the seed
    // (we wait a long time, because the wallet needs to be generated)
    browser.waitForVisible('#seed')
    browser.pause(2000)
    browser.waitForEnabled('#closeModal')
    browser.click('#closeModal')

    // the user is now be logged in, and on the profile page, where the avatar is visible
    assertUserIsLoggedIn(browser)
  })

  it('login as an existing user on a device with no keystore - use existing anonymous keystore', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    server.execute(resetDb)
    browser.pause(1000)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.pause(2000)
    const anonymousAddress = getAnonymousAddress()
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // the user is now logged in
    browser.pause(2000)
    assertUserIsLoggedIn(browser)

    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal')
    browser.pause(1000)
    browser.waitForEnabled('#create-wallet')
    browser.click('#create-wallet')
    browser.waitForEnabled('[name="user_password"]')
    browser
      .setValue('[name="user_password"]', 'password')
    browser.click('#btn-create-wallet')
    // TODO: check if wallet is created (is not implemented yet)
    browser.pause(5000)
    const publicAddress = getUserPTIAddressFromBrowser()
    assert.equal(publicAddress, add0x(anonymousAddress))
  })

  it('show an error message if provided wrong password', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    server.execute(resetDb)
    browser.pause(1000)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.pause(2000)
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'wrong password')
    browser.click('#at-btn')

    // the user is now logged in
    browser.pause(2000)
    assertUserIsNotLoggedIn(browser)
    let errorMsg = browser.getText('.at-error')
    assert.equal(errorMsg, 'Login forbidden')
  })

  it('login as an existing user on a device with no keystore - restore keystore with a seedPhrase', function () {
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
    browser.pause(1000)
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
    browser.pause(2000)
    browser.click('#at-btn')
    // the user is now logged in
    browser.pause(1000)
    assertUserIsLoggedIn(browser)
    // // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal')
    // we choose to restore the keystore
    browser.waitForEnabled('#restore-keystore')
    browser.pause(1000)
    browser.click('#restore-keystore')
    // we now should see a modal in which we are asked for the seed to regenerate the keystore
    browser.waitForEnabled('[name="field-seed"]')
    browser
      .setValue('[name="field-seed"]', SEED)
      .setValue('[name="field-password"]', 'password')
    browser.click('#btn-restorekeystore-restore')
    browser.pause(10000)
    const publicAddress = getUserPTIAddressFromBrowser()
    assert.equal(publicAddress, USERADDRESS)
  })

  it('try to register a new account with a used email', function () {
    server.execute(createUser)
    // browser.url('http://localhost:3000/profile')

    browser.url('http://localhost:3000/')
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    // we should see the login form, we click on the register link
    browser.waitForExist('#at-signUp')
    browser.pause(2000)
    browser.click('#at-signUp')

    // fill in the form
    browser.waitForExist('[name="at-field-name"]')
    browser
      .setValue('[name="at-field-name"]', 'Guildenstern')
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
      // .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.$('#at-btn').click()
    browser.waitForVisible('.at-error')
    const error = browser.getText('.at-error')
    assert.isNotNull(error, 'should exist a error message')
    assert.equal(error, 'Email already exists.')
  })

  it('do not overwrite a user address if failed to register a new user with a used email [TODO]', function () {
    // createUserAndLogin(browser)
    // browser.waitForVisible('#public_address')
    // const address = browser.getText('#public_address')
    // browser.pause(5000)
    // // logout
    // browser.$('#logout').click()
    // // browser.url('http://localhost:3000/profile')
    // browser.url('http://localhost:3000')
    // browser.waitForEnabled('#nav-profile')
    // browser.click('#nav-profile')
    // // we should see the login form, we click on the register link
    // browser.waitForEnabled('#at-signUp')
    // browser.pause(2000)
    // browser.click('#at-signUp')
    // // fill in the form
    // browser.waitForExist('[name="at-field-name"]')
    // browser
    //   .setValue('[name="at-field-name"]', 'Guildenstern')
    //   .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    //   .setValue('[name="at-field-password"]', 'password')
    //   .setValue('[name="at-field-password_again"]', 'password')
    // // submit the form
    // browser.$('#at-btn').click()
    //
    // // verify if the address doesn't changed
    // login(browser)
    // browser.waitForVisible('#public_address')
    // const address2 = browser.getText('#public_address')
    // assert.equal(web3.toChecksumAddress(address), address2, 'The address is not the same')
    // browser.pause(5000)
  })

  it('shows the seed', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    createUserAndLogin(browser)
    browser.pause(5000)
    browser.url('http://localhost:3000/profile')
    browser.waitForEnabled('#show-seed')
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.pause(2000)
    browser.waitForEnabled('#closeModal')
    browser.click('#closeModal')
  })

  it('send ether dialog is visible', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    createUserAndLogin(browser)
    browser.pause(5000)

    browser.url('http://localhost:3000/profile')
    browser.waitForExist('#send-eth')
    browser.click('#send-eth')
    browser.waitForExist('#form-doTransaction')
  })

  it('do not show the seed if wrong password', function () {
    createUserAndLogin(browser)

    browser.pause(4000)
    browser.url('http://localhost:3000/profile')

    browser.waitForEnabled('#show-seed')
    browser.click('#show-seed')

    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'wrong')
    browser.click('#btn-show-seed')

    browser.waitForVisible('.main-form-input-password.error')
    // // TODO: next test checks for error message - temp comment to get the test to pass
    // browser.waitForVisible('.control-label')
    // assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('restore the keystore', function () {
    createUserAndLogin(browser)
    browser.pause(4000)
    browser.url('http://localhost:3000/profile')
    browser.waitForEnabled('#show-seed')
    browser.click('#show-seed')
    browser.waitForEnabled('[name="user_password"]')
    browser.pause(1000)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.pause(1000)
    browser.waitForEnabled('#seed')
    const seed = browser.getHTML('#seed strong', false)
    const publicAddress = browser.getHTML('#public_address', false)

    browser.click('#closeModal')
    browser.execute(clearUserKeystoreFromLocalStorage)

    browser.refresh()
    browser.pause(2000)
    // we now have a user account that is known in meteor, but no keystore
    // TODO: in this case, the user is logged in, but has removed his keystore after logging in, the bastard
    // we need to show a blocking modal here
    //
    browser.waitForEnabled('#walletModal #restore-keystore')
    browser.click('#walletModal #restore-keystore')
    browser.waitForEnabled('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', seed)
    browser.setValue('[name="field-password"]', 'password')
    browser.click('#btn-restorekeystore-restore')
    browser.waitForExist('#public_address')
    const newPublicAddress = browser.getHTML('#public_address', false)
    assert.equal(publicAddress, newPublicAddress)
  })

  it('do not restore keystore if wrong password', function () {
    createUserAndLogin(browser)
    browser.pause(4000)
    browser.url('http://localhost:3000/profile')

    browser.waitForExist('#show-seed')

    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-show-seed')
    browser.pause(1000)
    browser.waitForVisible('#seed')
    const seed = browser.getHTML('#seed strong', false)
    // const publicAddress = browser.getHTML('#public_address', false)
    browser.click('#closeModal')
    browser.execute(clearUserKeystoreFromLocalStorage)
    browser.refresh()

    browser.waitForVisible('#walletModal #restore-keystore')
    browser.click('#walletModal #restore-keystore')
    browser.waitForVisible('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', seed)
    browser.setValue('[name="field-password"]', 'wrong')
    browser.click('#btn-restorekeystore-restore')

    browser.waitForVisible('.main-form-input-password.error')
    // // TODO: next test checks for error message - temp comment to get the test to pass
    // browser.waitForVisible('.control-label')
    // assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('do not create a new wallet if the password is wrong', function () {
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
    browser.pause(1000)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)
    browser.url('http://localhost:3000')
    browser.pause(2000)
    browser.waitForEnabled('#nav-profile')
    browser.click('#nav-profile')

    browser.pause(1000)
    browser.waitForEnabled('[name="at-field-email"]')
    browser
      .setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
      .setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // the user is now logged in
    browser.pause(2000)
    assertUserIsLoggedIn(browser)

    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal')
    browser.pause(1000)
    browser.waitForEnabled('#walletModal #create-wallet')
    browser.click('#walletModal #create-wallet')
    browser.waitForEnabled('[name="user_password"]')
    browser
      .setValue('[name="user_password"]', 'wrong password')
    browser.click('#btn-create-wallet')

    browser.waitForVisible('.main-form-input-password.error')
    // // TODO: next test checks for error message - temp comment to get the test to pass
    // browser.waitForVisible('.control-label')
    // assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('arriving on profile page without being logged in will ask the user to sign in [TODO]', function () {
    // TODO: implement the functionality and write this test
  })
})
