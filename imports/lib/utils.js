function formatNumber (number) {
  if (!number) {
    return false
  }
  const parts = number.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return parts.join('.')
}

function strip0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length >= 2 && input.slice(0, 2) === '0x') {
    return input.slice(2)
  }

  return input
}

function add0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return `0x${input}`
  }

  return input
}

function showModal (template) {
  Session.set('modalTemplate', template)
  Modal.show('mainModal', { setTemplate: template })
}

function hideModal (template) {
  Modal.hide()
}

export { formatNumber, add0x, strip0x, showModal, hideModal }
