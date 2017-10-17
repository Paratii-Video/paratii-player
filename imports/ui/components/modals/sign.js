import './sign.html'

let $modal
let $email
let $password
let isModalOpened = false
const animIn = 10
const animOut = 500

//

function emailValidation (address) {
  return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(address)
}

function modalGetElements () {
  $modal = $('div.main-modal-sign')
  $email = $('[name=email]')
  $password = $('[name=password]')
}

function modalShowContent () {
  let timeAnimIn

  modalGetElements()

  timeAnimIn = animIn

  if (!isModalOpened) {
    isModalOpened = true
    timeAnimIn = animIn + 850
  }

  Meteor.setTimeout(function () {
    $modal.addClass('show-content')
  }, timeAnimIn)
}

function modalHideContent (instance, type) {
  $modal.removeClass('show-content')
  Meteor.setTimeout(function () {
    instance.templateInstance().modalState.set('type', type)
  }, animOut)
}

// Sign

Template.modal_sign.helpers({
  isSignIn: function (type) {
    return type === 'sign_in'
  },
  isSignUp: function (type) {
    return type === 'sign_up'
  },
  isConfirm: function (type) {
    return type === 'confirm'
  },
  modalType: function () {
    return Template.instance().modalState.get('type')
  }
})

Template.modal_sign.onCreated(function () {
  isModalOpened = false
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

// Sign in

Template.modal_sign_in.onRendered(modalShowContent)

Template.modal_sign_in.events({
  'click button.gotosignup' (event, instance) {
    modalHideContent(instance.view.parentView.parentView, 'sign_up')
  },
  'submit form.main-modal-form' (event) {
    event.preventDefault()
    let email = $email.val()
    let password = $password.val()

    if (!emailValidation(email)) {
      $email.addClass('error')
    } else {
      $email.removeClass('error')
      Meteor.loginWithPassword(email, password, (event) => {
        if (event) {
          if (event.error) {
            $email.addClass('error')
            $password.addClass('error')
          }
        } else {
          Modal.hide('modal_sign')
        }
      })
    }
  }
})

// Sign up

Template.modal_sign_up.onRendered(modalShowContent)

Template.modal_sign_up.events({
  'click button.gotosignin' (event, instance) {
    modalHideContent(instance.view.parentView.parentView, 'sign_in')
  },
  'submit form.main-modal-form' (event) {
    event.preventDefault()
  }
})
