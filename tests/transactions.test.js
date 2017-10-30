/* eslint-disable: global-require, no-alert */
/* eslint global-require: "off" */
import { resetDb, clearUserKeystoreFromLocalStorage } from './helpers.js'

describe('account workflow', function () {
  beforeEach(function () {
    browser.url('http://127.0.0.1:3000/')
    server.execute(resetDb)
  })

  afterEach(function () {
    browser.execute(clearUserKeystoreFromLocalStorage)
  })

  it('check if page works', function () {
    browser.url('http://127.0.0.1:3000/transactions')
    // we should see the login form, we click on the register link
  })
})
