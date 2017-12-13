
export function log (message) {
  if (Meteor.settings.public.isTestEnv) {
    console.log(message)
  }
}

export function formatNumber (number) {
  if (!number) {
    return false
  }
  const parts = number.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return parts.join('.')
}

export function formatCoinBalance (balance = 0) {
  return parseFloat(balance).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )
}

export function strip0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length >= 2 && input.slice(0, 2) === '0x') {
    return input.slice(2)
  }
  return input
}

export function add0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return `0x${input}`
  }
  return input
}

// Show & hide Loader

export function showLoader (message, list) {
  Session.set('showLoaderPhrases', typeof message === 'object')
  Session.set('mainLoaderList', list)
  Session.set('mainLoaderText', message)
  Session.set('showMainLoader', true)
}

export function hideLoader () {
  Session.set('showMainLoader', false)
  Session.set('mainLoaderText', null)
}

// Show & hide Modal
export function showModal (templateName, options = null) {
  Session.set('modalContentTemplate', templateName)
  Session.set('modalOptions', options)
  Modal.show('mainModal', options, {backdrop: 'static'})
}

export function hideModal (template) {
  if (!template || Session.get('modalContentTemplate') === template) {
    Modal.hide()
    Session.set('modalContentTemplate', null)
  }
}

// Manage errors on Alerts
export function showGlobalAlert (message, style) {
  Session.set('globalAlertClass', style)
  Session.set('globalAlertMessage', message)
  Meteor.setTimeout(() => {
    Session.set('globalAlertShow', 'show')
  }, 100)
}

export function hideGlobalAlert () {
  Session.set('globalAlertShow', '')
  Meteor.setTimeout(() => {
    Session.set('globalAlertMessage', null)
  }, 600)
}

export function showModalAlert (message, style) {
  Session.set('modalAlertClass', style)
  Session.set('modalAlertMessage', message)
  Meteor.setTimeout(() => {
    Session.set('modalAlertShow', 'show')
  }, 100)
}

export function hideModalAlert () {
  Session.set('modalAlertShow', '')
  Meteor.setTimeout(() => {
    Session.set('modalAlertMessage', null)
  }, 600)
}

export function resetAlert () {
  Session.set('globalAlertShow', null)
  Session.set('globalAlertMessage', null)
  Session.set('modalAlertShow', null)
  Session.set('modalAlertMessage', null)
}

export function removeTrailingSlash (str) {
  return str.replace(/\/$/, '')
}

export function _ (message) {
  return require('meteor/tap:i18n').TAPi18n.__(message)
}

export function setIsNavigatingBack (navigatingBack = false) {
  Session.set('navigatingBack', navigatingBack)
}

export function getIsNavigatingBack () {
  return Session.get('navigatingBack')
}

function getNavHistory () {
  return Session.get('navigationHistory') || []
}

export function addToNavigationHistory (prevPath) {
  if (prevPath && prevPath !== getPrevPageFromHistory()) {
    const navigationHistory = getNavHistory()
    navigationHistory.push(prevPath)
    Session.set('navigationHistory', navigationHistory)
  }
}

export function popNavigationHistory () {
  const navigationHistory = getNavHistory()
  navigationHistory.pop()
  Session.set('navigationHistory', navigationHistory)
}

export function getPrevPageFromHistory () {
  const navigationHistory = getNavHistory()

  return navigationHistory[navigationHistory.length - 1]
}

const isFullscreen = () => (
  document.fullscreenElement ||
  document.mozFullScreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement
)

const requestCancelFullscreen = (element) => {
  if (element.exitFullscreen) {
    element.exitFullscreen()
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen()
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen()
  }
}

const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
}

export const toggleFullscreen = (element) => {
  if (isFullscreen()) {
    requestCancelFullscreen(document)
  } else {
    requestFullscreen(element)
  }
}

// export function setModalState (message) {
//   Session.set('modalStateMessage', message)
// }

// change password type
export function changePasswordType () {
  let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
  Session.set('passwordType', inputType)
}

export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
