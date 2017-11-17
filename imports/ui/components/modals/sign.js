import './sign.html'

// Sign(wrapper)

Template.modal_sign.onCreated(function () {
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

Template.modal_sign.helpers({
  isSignIn: (type) => type === 'modal_sign_in',
  isSignUp: (type) => type === 'modal_sign_up',
  isConfirm: (type) => type === 'modal_wait_confirm',
  isForgotStep1: (type) => type === 'modal_forgot_password_step_1',
  isForgotStep2: (type) => type === 'modal_forgot_password_step_2',
  modalType: () => Template.instance().modalState.get('type')
})

// Sign in

Template.modal_sign_in.onCreated(() => {
  Session.set('passwordType', 'password')
})

Template.modal_sign_in.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal-sign-in').addClass('show-content'), timeIn)
})

Template.modal_sign_in.helpers({
  passwordType: () => Session.get('passwordType')
})

Template.modal_sign_in.events({
  'click button.gotosignup' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal-sign-in').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_sign_up'), 300)
  },
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  },
  'click #button-forgot' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal-sign-in').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_forgot_password_step_1'), 300)
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    let $email = $('input[name=email]')
    let $password = $('input[name=password]')

    Meteor.loginWithPassword($email.val(), $password.val(), (err) => {
      if (err) {
        $email.addClass('error')
        $password.addClass('error')
      } else {
        Modal.hide('modal_sign')
      }
    })
  }
})

// Register

Template.modal_sign_up.onCreated(() => {
  Session.set('passwordType', 'password')
})

Template.modal_sign_up.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal-sign-up').addClass('show-content'), timeIn)
})

Template.modal_sign_up.helpers({
  passwordType: () => Session.get('passwordType')
})

Template.modal_sign_up.events({
  'click button.gotosignin' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal-sign-up').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_sign_in'), 300)
  },
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    let $username = $('input[name=username]')
    let $email = $('input[name=email]')
    let $password = $('input[name=password]')

    let userData = {
      username: $username.val(),
      email: $email.val(),
      password: $password.val()
    }

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
        }
      } else {
        let templateView = instance.view.parentView.parentView

        $('div.main-modal-sign-up').removeClass('show-content')
        Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_wait_confirm'), 300)
      }
    })
  }
})

// Wait Confirm after registering

Template.modal_wait_confirm.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal-confirm-wait').addClass('show-content'), timeIn)
})

// Forgot password
// Step 1

Template.modal_forgot_password_step_1.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal-forgot-1').addClass('show-content'), timeIn)
})

Template.modal_forgot_password_step_1.events({
  'click button.gotosignin' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal-forgot-1').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_sign_in'), 300)
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    // let $email = $('input[name=email]')
    // Accounts.findUserByEmail($email.val())

    // Success
    // #just for test. need to apply the right method
    $('div.main-modal-forgot-1').addClass('waiting')
    Meteor.setTimeout(() => {
      let templateView = instance.view.parentView.parentView

      $('div.main-modal-forgot-1').removeClass('show-content')
      Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_forgot_password_step_2'), 300)
    }, 1000)
  }
})

// Step 2

Template.modal_forgot_password_step_2.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal-forgot-2').addClass('show-content'), timeIn)
})

Template.modal_forgot_password_step_2.helpers({
  userEmail: () => 'userData.email'
})
