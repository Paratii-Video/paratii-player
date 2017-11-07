export function formatNumber (number) {
  if (!number) {
    return false
  }
  const parts = number.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return parts.join('.')
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

// Show & hide Modal
export function showModal (templateName, options = null) {
  const template = { contentTemplate: templateName }
  const modalOptions = Object.assign(template, options)
  Session.set('contentTemplate', templateName)
  Modal.show('mainModal', modalOptions)
}

export function hideModal (template) {
  Modal.hide()
  Session.set('contentTemplate', null)
}

// Manage error on Modals
export function setModalError (message) {
  // The message to show in the alert
  Session.set('modalErrorMessage', message)
  // The class show open the alert
  Session.set('classAlertModal', 'show')
}

export function setModalState (message) {
  Session.set('modalStateMessage', message)
}

// Manage global errors
export function setGlobalError (message) {
  // The message to show in the alert
  Session.set('globalErrorMessage', message)
  // The class show open the alert
  Session.set('classAlertGlobal', 'show')
}

export function changePasswordType () {
  let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
  Session.set('passwordType', inputType)
}
