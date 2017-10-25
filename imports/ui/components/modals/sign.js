import './sign.html'

//

var $modal
var $email
var $password
var $username
var isModalOpened = false
var userData
const animIn = 10
const animOut = 300

//

function emailValidation (address) {
  return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(address)
}

function modalGetElements (type) {
  $email = $('input[name=email]')
  $password = $('input[name=password]')
  if (type === 'sign-up') {
    $username = $('input[name=username]')
  }
}

function modalShowContent (type) {
  let timeAnimIn = animIn

  if (type !== 'confirm') modalGetElements(type)

  if (!isModalOpened) {
    isModalOpened = true
    timeAnimIn = animIn + 850
  }

  Meteor.setTimeout(() => $modal.addClass('show-content'), timeAnimIn)
}

function modalChangeContent (template, type) {
  $modal.removeClass('show-content')
  Meteor.setTimeout(() => template.templateInstance().modalState.set('type', type), animOut)
}

function formSignInUpValidation (type) {
  userData = {
    username: (type === 'sign-up') ? $username.val() : '',
    email: $email.val(),
    password: $password.val()
  }

  if (type === 'sign-up') $username.removeClass('error')
  $password.removeClass('error')
  $email.removeClass('error')

  if (type === 'sign-up' && userData.username.lenght < 2) {
    $username.addClass('error')
    return false
  } else if (!emailValidation(userData.email)) {
    $email.addClass('error')
    return false
  } else {
    return true
  }
}

// Sign

Template.modal_sign.onCreated(function () {
  isModalOpened = false
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

Template.modal_sign.onRendered(() => {
  $modal = $('div.main-modal-sign')
})

Template.modal_sign.helpers({
  isSignIn: (type) => type === 'sign_in',
  isSignUp: (type) => type === 'sign_up',
  isConfirm: (type) => type === 'confirm',
  isForgotStep1: (type) => type === 'forgot_step_1',
  isForgotStep2: (type) => type === 'forgot_step_2',
  modalType: () => Template.instance().modalState.get('type'),
  modalClass: () => 'main-modal-' + Template.instance().modalState.get('type')
})

// Sign in

Template.modal_sign_in.onCreated(() => Session.set('passwordType', 'password'))

Template.modal_sign_in.onRendered(() => modalShowContent('sign-in'))

Template.modal_sign_in.helpers({
  passwordType: () => Session.get('passwordType')
})

Template.modal_sign_in.events({
  'click button.gotosignup' (event, instance) {
    modalChangeContent(instance.view.parentView.parentView, 'sign_up')
  },
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  },
  'click #button-forgot' (event, instance) {
    modalChangeContent(instance.view.parentView.parentView, 'forgot_step_1')
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()
    if (formSignInUpValidation('sign-in')) {
      Meteor.loginWithPassword(userData.email, userData.password, (err) => {
        if (err) {
          $email.addClass('error')
          $password.addClass('error')
        } else {
          Modal.hide('modal_sign')
        }
      })
    }
  }
})

// Sign up

Template.modal_sign_up.onCreated(() => {
  Session.set('passwordType', 'password')
})

Template.modal_sign_up.onRendered(() => modalShowContent('sign-up'))

Template.modal_sign_up.helpers({
  passwordType: () => Session.get('passwordType')
})

Template.modal_sign_up.events({
  'click button.gotosignin' (event, instance) {
    modalChangeContent(instance.view.parentView.parentView, 'sign_in')
  },
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()
    if (formSignInUpValidation('sign-up')) {
      Accounts.createUser(userData, (err) => {
        if (err) {
          if (err.reason === 'Need to set a username or email') {
            $email.addClass('error')
            $username.addClass('error')
            $password.removeClass('error')
          } else if (err.reason === 'Password may not be empty') {
            $email.removeClass('error')
            $username.removeClass('error')
            $password.addClass('error')
          } else if (err.reason === 'Email already exists') {
            $email.removeClass('error')
            $username.removeClass('error')
            $password.addClass('error')
          } else {
            $email.removeClass('error')
            $password.removeClass('error')
            $username.removeClass('error')
            console.log(err)
          }
        } else {
          modalChangeContent(instance.view.parentView.parentView, 'confirm')
        }
      })
    }
  }
})

// Forgot password

Template.modal_forgot_password_step_1.onRendered(() => modalShowContent('forgot-step-1'))
Template.modal_forgot_password_step_1.events({
  'click button.gotosignin' (event, instance) {
    modalChangeContent(instance.view.parentView.parentView, 'sign_in')
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    $('[name=email]').removeClass('error')

    userData = {
      email: $('[name=email]').val()
    }

    if (!emailValidation(userData.email)) {
      $('[name=email]').addClass('error')
    } else {
      $modal.addClass('waiting')
      // #just for test. need to apply the right method
      Meteor.setTimeout(() => {
        modalChangeContent(instance.view.parentView.parentView, 'forgot_step_2')
      }, 1000)
      // /just for test. need to apply the right method
    }
  }
})

Template.modal_forgot_password_step_2.onRendered(() => modalShowContent('forgot-step-2'))
Template.modal_forgot_password_step_2.helpers({
  userEmail: () => userData.email
})

// Cofirm

Template.modal_wait_confirm.onRendered(() => modalShowContent('confirm'))
