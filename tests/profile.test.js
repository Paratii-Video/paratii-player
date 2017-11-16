/* global localStorage */
import {
  SEED,
  USERADDRESS,
  createUserKeystore,
  getAnonymousAddress,
  createUser,
  resetDb,
  createUserAndLogin,
  login,
  assertUserIsLoggedIn,
  waitForUserIsLoggedIn,
  assertUserIsNotLoggedIn,
  nukeLocalStorage,
  clearUserKeystoreFromLocalStorage,
  getUserPTIAddressFromBrowser,
  waitForKeystore
} from './helpers.js'
import { sendSomeETH } from '../imports/lib/ethereum/helpers.js'
import { add0x } from '../imports/lib/utils.js'
import { assert } from 'chai'

describe('Profile and accounts workflow:', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/')
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
  })

  it('register a new user ', function () {
    browser.execute(nukeLocalStorage)
    browser.url('http://localhost:3000')

    // log in as the created user
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')

    browser.waitForClickable('#at-signUp')
    browser.click('#at-signUp')

    // fill in the form
    browser.waitForClickable('[name="at-field-name"]')
    browser.setValue('[name="at-field-name"]', 'Guildenstern')
    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'password')
    // .setValue('[name="at-field-password_again"]', 'password')

    // submit the form
    browser.waitForClickable('#at-btn')
    browser.click('#at-btn')

    // the new user is automaticaly logged in after account creation
    waitForUserIsLoggedIn(browser)

    // wait for the keystore to be generated
    waitForKeystore(browser)
    // now a modal should be opened with the seed
    browser.waitForClickable('#seed')
    browser.pause(1000)
    browser.waitForClickable('#closeModal')
    browser.click('#closeModal')

    // the user is now logged in
    assertUserIsLoggedIn(browser)
  })

  it('login as an existing user on a device with no keystore - use existing anonymous keystore ', function () {
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)

    // create a meteor user
    server.execute(createUser)

    assertUserIsNotLoggedIn(browser)

    // go to the home page
    browser.url('http://localhost:3000')
    // wait until we have an anymous keystore available
    browser.waitUntil(function () {
      return browser.execute(function () {
        return localStorage.getItem(`keystore-anonymous`)
      }).value
    })
    const anonymousAddress = getAnonymousAddress()
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')

    browser.waitForClickable('[name="at-field-email"]')
    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // the user is now logged in
    waitForUserIsLoggedIn(browser)

    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForClickable('#walletModal')
    browser.waitForClickable('#create-wallet')
    browser.click('#create-wallet')
    browser.waitForClickable('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#btn-create-wallet')

    waitForKeystore(browser)

    // the address of the new keystore should be the same as the old 'anonymous' address
    const publicAddress = getUserPTIAddressFromBrowser()
    assert.equal(publicAddress, add0x(anonymousAddress))
  })

  it('change password', async function (done) {
    browser.execute(clearUserKeystoreFromLocalStorage)
    createUserAndLogin(browser)
    waitForUserIsLoggedIn(browser)
    const userAccount = getUserPTIAddressFromBrowser()
    sendSomeETH(userAccount, 3.1)
    browser.url('http://localhost:3000/profile')
    browser.waitForClickable('#edit-profile')
    browser.click('#edit-profile')
    browser.waitForClickable('.edit-password')
    browser.click('.edit-password')
    // TODO remove this pause, problem with modals
    browser.pause(2000)
    browser.waitForClickable('[name="current-password"]', 5000)
    browser.setValue('[name="current-password"]', 'password')
    browser.setValue('[name="new-password"]', 'new-password')
    browser.waitForClickable('#save-password')
    browser.click('#save-password')
    browser.pause(2000)
    browser.waitForClickable('.wallet-contents li:last-child .amount')
    const amount = await browser.getText('.wallet-contents li:last-child .balance', false)
    assert.isOk(['3.10 ETH', '3,10 ETH'].indexOf(amount) > -1)
    done()
  })

  it('show an error message if provided wrong password ', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    server.execute(resetDb)
    browser.pause(2000)

    // create a meteor user
    server.execute(createUser)

    // log in as the created user
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')

    browser.waitForClickable('[name="at-field-email"]')

    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'wrong password')
    browser.click('#at-btn')

    // the user is now still not logged in
    assertUserIsNotLoggedIn(browser)

    browser.waitForClickable('.at-error')
    let errorMsg = browser.getText('.at-error')
    assert.equal(errorMsg, 'Login forbidden')
  })

  it('login as an existing user on a device with no keystore - restore keystore with a seedPhrase', function () {
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
    // create a meteor user
    server.execute(createUser)
    assertUserIsNotLoggedIn(browser)

    browser.url('http://localhost:3000')
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')
    browser.waitForClickable('[name="at-field-email"]')
    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'password')
    browser.waitForClickable('#at-btn')
    browser.click('#at-btn')

    waitForUserIsLoggedIn(browser)
    // // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForExist('#walletModal')
    // we choose to restore the keystore
    browser.waitForClickable('#restore-keystore')
    browser.click('#restore-keystore')
    // we now should see a modal in which we are asked for the seed to regenerate the keystore
    browser.waitForClickable('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', SEED)
    browser.setValue('[name="field-password"]', 'password')
    browser.click('#btn-restorekeystore-restore')
    browser.waitUntil(function () {
      let publicAddress = getUserPTIAddressFromBrowser()
      return publicAddress === USERADDRESS
    })
  })

  it('try to register a new account with a used email', function () {
    server.execute(createUser)
    // browser.url('http://localhost:3000/profile')

    browser.url('http://localhost:3000/')
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')
    browser.pause(2000)
    // we should see the login form, we click on the register link
    browser.waitForClickable('#at-signUp')
    browser.click('#at-signUp')
    browser.pause(2000)
    // fill in the form
    browser.waitForExist('[name="at-field-name"]')
    browser.setValue('[name="at-field-name"]', 'Guildenstern')
    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'password')
    // .setValue('[name="at-field-password_again"]', 'password')
    // submit the form
    browser.click('#at-btn')
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
    // browser.waitForClickable('#nav-profile')
    // browser.click('#nav-profile')
    // // we should see the login form, we click on the register link
    // browser.waitForClickable('#at-signUp')
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
    // browser.url('http://localhost:3000/profile')
    browser.execute(function () {
      utils = require('/imports/lib/utils.js') // eslint-disable-line no-undef
      utils.showModal('showSeed') // eslint-disable-line no-undef
    })

    // the showSeed modal should now be visible
    browser.waitForVisible('#show-seed')

    // TODO: why do we not ask for a password anymore here?
    // browser.waitForVisible('[name="user_password"]')
    // browser.setValue('[name="user_password"]', 'password')
    // browser.waitForEnabled('#btn-show-seed')
    // browser.pause(1000)
    // browser.click('#btn-show-seed')
    // browser.waitForClickable('#closeModal')
  })

  it('send ether dialog works', function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
    createUserAndLogin(browser)
    browser.execute(function () {
      utils = require('/imports/lib/utils.js') // eslint-disable-line no-undef
      utils.showModal('doTransaction', { type: 'Eth', label: 'Send Ether' }) // eslint-disable-line no-undef
    })

    // browser.url('http://localhost:3000/profile')
    // browser.waitForEnabled('#send-eth')
    // browser.pause(1000)
    browser.waitForExist('#form-doTransaction')
    // browser.pause(1000)
  })

  it.skip('do not show the seed if wrong password', function () {
    createUserAndLogin(browser)
    browser.pause(3000)
    browser.url('http://localhost:3000/profile')

    browser.waitForClickable('#show-seed')
    browser.click('#show-seed')
    browser.waitForVisible('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'wrong')
    browser.waitForEnabled('#btn-show-seed')
    browser.pause(1000)
    browser.click('#btn-show-seed')

    // browser.waitForVisible('.main-form-input-password.error', 30000)
    browser.waitForVisible('.main-form-input-password.error')

    // // TODO: next test checks for error message - temp comment to get the test to pass
    // browser.waitForVisible('.control-label')
    // assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it.skip('restore the keystore', function () {
    createUserAndLogin(browser)
    browser.pause(4000)
    browser.url('http://localhost:3000/profile')
    browser.waitForClickable('#show-seed')
    browser.click('#show-seed')
    browser.waitForClickable('[name="user_password"]')
    browser.pause(1000)
    browser.setValue('[name="user_password"]', 'password')
    browser.waitForEnabled('#btn-show-seed')
    browser.click('#btn-show-seed')
    browser.pause(1000)
    browser.waitForClickable('#seed')
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
    browser.waitForClickable('#walletModal #restore-keystore')
    browser.click('#walletModal #restore-keystore')
    browser.waitForClickable('[name="field-seed"]')
    browser.setValue('[name="field-seed"]', seed)
    browser.setValue('[name="field-password"]', 'password')
    browser.click('#btn-restorekeystore-restore')
    browser.waitForExist('#public_address')
    const newPublicAddress = browser.getHTML('#public_address', false)
    assert.equal(publicAddress, newPublicAddress)
  })

  it.skip('do not restore keystore if wrong password', function () {
    createUserAndLogin(browser)
    browser.url('http://localhost:3000/profile')
    browser.waitForClickable('#show-seed')
    browser.click('#show-seed')
    browser.waitForEnabled('[name="user_password"]')
    browser.pause(500)
    browser.setValue('[name="user_password"]', 'password')
    browser.waitForClickable('#btn-show-seed')
    browser.click('#btn-show-seed')
    browser.waitForClickable('#seed')
    const seed = browser.getHTML('#seed strong', false)
    // const publicAddress = browser.getHTML('#public_address', false)
    browser.waitForClickable('#closeModal')
    browser.click('#closeModal')
    browser.execute(clearUserKeystoreFromLocalStorage)
    browser.refresh()

    browser.waitForClickable('#walletModal #restore-keystore')
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
    // create a meteor user
    server.execute(createUser)
    assertUserIsNotLoggedIn(browser)

    // log in as the created user
    browser.url('http://localhost:3000')
    browser.waitForClickable('#nav-profile')
    browser.click('#nav-profile')

    browser.waitForClickable('[name="at-field-email"]')
    browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
    browser.setValue('[name="at-field-password"]', 'password')
    browser.click('#at-btn')

    // the user is now logged in
    waitForUserIsLoggedIn(browser)

    // we should now see a modal presenting a choice to restore the wallet or use a new one
    browser.waitForClickable('#walletModal')
    browser.waitForClickable('#walletModal #create-wallet')
    browser.click('#walletModal #create-wallet')
    browser.waitForClickable('[name="user_password"]')
    browser.setValue('[name="user_password"]', 'wrong password')
    browser.click('#btn-create-wallet')

    browser.waitForVisible('.main-form-input-password.error')
    // // TODO: next test checks for error message - temp comment to get the test to pass
    // browser.waitForVisible('.control-label')
    // assert.equal(browser.getText('.control-label'), 'Wrong password', 'should show "Wrong password" text')
  })

  it('arriving on profile page without being logged should redirect to home', function () {
    // TODO: implement the functionality and write this test
    browser.url('http://localhost:3000/profile')
    const url = browser.url()
    browser.pause(1000)
    assert.equal(url.value, 'http://localhost:3000/')
  })

  it('arriving on the app with a keystore, but without being logged in, should ask what to do, then continue anonymously @watch', function () {
    // We show a modal with a short explation :
    // 'A wallet was found on this computer. Please sign in to use this wallet; or continue navigating anonymously'
    // if the user chooses the second option, a session var should be st so the user is not bothered again in the future
    createUserKeystore(browser)
    browser.url('http://localhost:3000')

    assertUserIsNotLoggedIn(browser)

    browser.waitForVisible('#foundKeystore')
    // the user can now choose between contiuing anonimously, or to log in
    // we choose anonimity
    browser.waitAndClick('#btn-foundKeystore-cancel')
    // we now see the main-alert-content
    browser.waitForEnabled('.main-alert-content')
    // and dismiss it
    browser.waitAndClick('.main-alert-button-close')
    // we remain not logged in
    assertUserIsNotLoggedIn(browser)
  })

  it('arriving on the app with a keystore, but without being logged in, should ask what to do, then proceed to log in @watch', function () {
    // We show a modal with a short explation :
    // 'A wallet was found on this computer. Please sign in to use this wallet; or continue navigating anonymously'
    // if the user chooses the second option, a session var should be st so the user is not bothered again in the future
    createUserKeystore(browser)
    browser.url('http://localhost:3000')
    assertUserIsNotLoggedIn(browser)

    browser.waitForVisible('#foundKeystore')
    // the user can now choose between contiuing anonimously, or to log in
    // we choose anonimity
    browser.waitAndClick('#btn-foundKeystore-login')

    // we should now see the login modal
    browser.waitForVisible('#loginModal')
  })

  describe('Password reset:', () => {
    it('should not allow the user to change their password if they enter the incorrect current password', function () {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-password')
      browser.click('.edit-password')
      browser.waitAndSetValue('#current-password', 'foobar')
      browser.waitAndSetValue('#new-password', 'myshinynewpassword')
      browser.click('#save-password')

      assert.equal(browser.isVisible('.edit-password-modal'), true)
      browser.waitForVisible('.main-alert-content')
      browser.waitUntil(() => {
        console.log(browser.getText('.main-alert-content'))
        return browser.getText('.main-alert-content') === 'Wrong password'
      })
    })

    it('should not allow the user to attempt to change their password if they do not enter their current password', function () {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-password')
      browser.click('.edit-password')
      browser.waitAndSetValue('#current-password', 'myshinynewpassword')
      browser.click('#save-password')

      assert.equal(browser.isVisible('.edit-password-modal'), true)
      assert.equal(browser.getAttribute('#save-password', 'disabled'), 'true')
    })

    it('should not allow the user to attempt to change their password if they do not enter a new password', function () {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitAndClick('#edit-profile')
      browser.waitAndClick('.edit-password')
      browser.waitAndSetValue('#current-password', 'myshinynewpassword')
      browser.click('#save-password')

      assert.equal(browser.isVisible('.edit-password-modal'), true)
      assert.equal(browser.getAttribute('#save-password', 'disabled'), 'true')
    })

    it('should not allow the user to attempt to change their password if they do not enter their current password or a new password', function () {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-password')
      browser.click('.edit-password')
      browser.waitForClickable('#current-password')
      assert.equal(browser.getAttribute('#save-password', 'disabled'), 'true')
    })

    it('should allow the user to attempt to change their password if they enter the correct current password and a new password', function () {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-password')
      browser.click('.edit-password')
      browser.waitAndSetValue('#current-password', 'password')
      browser.waitAndSetValue('#new-password', 'foobar')
      browser.waitForClickable('#save-password')
      browser.click('#save-password')

      browser.waitUntil(() => {
        return !browser.isVisible('.edit-password-modal')
      })
      browser.pause(500)
      browser.waitForClickable('#logout a')
      browser.click('#logout a')
      browser.waitForVisible('#confirmLogout')
      browser.pause(500)
      browser.waitForClickable('#logoutBtn')
      browser.click('#logoutBtn')
      browser.waitForClickable('#nav-profile')
      assertUserIsNotLoggedIn(browser)

      login(browser, 'foobar')

      waitForUserIsLoggedIn(browser)
      assertUserIsLoggedIn(browser)
    })
  })

  describe('edit profile', () => {
    it('should render the current profile\'s information correctly', () => {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-profile-info')
      browser.click('.edit-profile-info')
      browser.waitForVisible('.edit-profile-info-modal')

      assert.equal(browser.getAttribute('#new-username', 'placeholder'), 'foobar baz')
      assert.equal(browser.getAttribute('#new-email', 'placeholder'), 'guildenstern@rosencrantz.com')
      assert.equal(browser.getAttribute('.current-avatar', 'src'), 'https://google.com/images/stock.jpg')
    })

    it('should not allow the user to save profile information if no new information is entered', () => {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-profile-info')
      browser.click('.edit-profile-info')
      browser.waitForVisible('.edit-profile-info-modal')

      assert.equal(browser.getAttribute('#save-profile-info', 'disabled'), 'true')
    })

    it('should not allow the user to save profile information if only whitespace is entered into the name or email fields', () => {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')
      browser.click('#edit-profile')
      browser.waitForClickable('.edit-profile-info')
      browser.click('.edit-profile-info')
      browser.waitForVisible('.edit-profile-info-modal')
      browser.waitAndSetValue('#new-username', '        \n ')

      assert.equal(browser.getAttribute('#save-profile-info', 'disabled'), 'true')

      browser.waitForVisible('.edit-profile-info-modal')
      browser.waitAndSetValue('#new-email', '       ')

      assert.equal(browser.getAttribute('#save-profile-info', 'disabled'), 'true')
    })

    it('should allow the user to update their name', () => {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')

      assert.equal(browser.getText('.header-title'), 'foobar baz')

      browser.click('#edit-profile')
      browser.waitForClickable('.edit-profile-info')
      browser.click('.edit-profile-info')
      browser.waitForVisible('.edit-profile-info-modal')
      browser.waitAndSetValue('#new-username', 'my shiny new name')

      browser.waitForClickable('#save-profile-info')
      browser.click('#save-profile-info')

      browser.waitUntil(() => {
        return browser.getText('.header-title') === 'my shiny new name'
      })
    })

    it('should allow the user to update their email', () => {
      createUserAndLogin(browser)
      browser.url('http://localhost:3000/profile')
      browser.waitForClickable('#edit-profile')

      assert.equal(browser.getText('.profile-info-email'), 'guildenstern@rosencrantz.com')

      browser.click('#edit-profile')
      browser.waitForClickable('.edit-profile-info')
      browser.waitAndClick('.edit-profile-info')
      browser.waitForVisible('.edit-profile-info-modal')

      browser.waitAndSetValue('#new-email', 'myGreatEmail@aol.com')

      browser.waitForClickable('#save-profile-info')
      browser.click('#save-profile-info')

      browser.waitUntil(() => {
        return browser.getText('.profile-info-email') === 'myGreatEmail@aol.com'
      })
    })
  })
})
