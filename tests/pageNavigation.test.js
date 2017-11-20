import { assert } from 'chai'
import { createUserAndLogin, nukeLocalStorage, resetDb } from './helpers'

describe('Page Navigation:', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000')
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
    createUserAndLogin(browser)
  })

  describe('search page', () => {
    it('should not display a back button if the user first navigates to the page', () => {
      browser.url('http://localhost:3000/search')

      browser.waitUntil(() => {
        return browser.getText('.internal-header-title') === 'Search'
      })

      assert.equal(browser.isVisible('#back-button'), false)
    })

    it('should navigate to the previous page when the user clicks the back button after having nagivating from another page', () => {
      browser.url('http://localhost:3000/playlists')

      browser.waitAndClick('#search')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Search'
      })

      browser.waitAndClick('#back-button')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })
    })
  })

  describe('profile page', () => {
    it('should not display a back button if the user first navigates to the page', () => {
      browser.url('http://localhost:3000/profile')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'foobar baz'
      })

      assert.equal(browser.isVisible('#back-button'), false)
    })

    it('should navigate to the previous page when the user clicks the back button after having nagivating from another page', () => {
      browser.url('http://localhost:3000/playlists')

      browser.waitAndClick('#nav-profile')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'foobar baz'
      })

      browser.waitAndClick('#back-button')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })
    })
  })

  describe('playlists page', () => {
    it('should not display a back button if the user first navigates to the page', () => {
      browser.url('http://localhost:3000/playlists')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })

      assert.equal(browser.isVisible('#back-button'), false)
    })

    it('should navigate to the previous page when the user clicks the back button after having nagivating from another page', () => {
      browser.url('http://localhost:3000/search')

      browser.waitAndClick('#playlist')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })

      browser.waitAndClick('#back-button')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Search'
      })
    })

    it('should navigate from an individual playlist to the playlists page after the user has clicked on a playlist', () => {
      browser.url('http://localhost:3000/playlists')

      browser.waitUntil(() => {
        return browser.isVisible('.playlists .thumbs-list-item:first-child')
      })
      const playlistTitle = browser.getText('.playlists .thumbs-list-item:first-child .thumbs-list-title')
      browser.waitAndClick('.playlists .thumbs-list-item:first-child')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === playlistTitle
      })

      browser.waitAndClick('#back-button')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })
    })

    it('should navigate from an individual playlist to the playlists page even after the user has navigated directly to a playlist page', () => {
      browser.url('http://localhost:3000/playlists/1')

      browser.waitAndClick('#back-button')

      browser.waitUntil(() => {
        return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
      })
    })
  })

  it('should navigate back and forth between two pages when the back button is clicked', () => {
    browser.url('http://localhost:3000/playlists')

    browser.waitAndClick('#search')

    browser.waitUntil(() => {
      return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Search'
    })

    browser.waitAndClick('#back-button')

    browser.waitUntil(() => {
      return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Playlists'
    })

    browser.waitAndClick('#search')

    browser.waitUntil(() => {
      return browser.isVisible('.internal-header-title') && browser.getText('.internal-header-title') === 'Search'
    })
  })
})
