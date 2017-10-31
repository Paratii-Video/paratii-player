import './newPassword.html'

var $modal
var isModalOpened = false
const animIn = 10
const animOut = 300

function modalShowContent () {
  let timeAnimIn = animIn

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

//

Template.modal_new_password.onCreated(function () {
  let type

  isModalOpened = false
  this.modalState = new ReactiveDict()
  type = (this.data) ? this.data.type : 'new_password_pass'

  this.modalState.set('type', type)
})

Template.modal_new_password.onRendered(() => {
  $modal = $('div.main-modal-newpassword')
})

Template.modal_new_password.helpers({
  isSetPassword: (type) => type === 'new_password_pass',
  isSetWords: (type) => type === 'new_password_words',
  isRecoverComplete: (type) => type === 'new_password_complete',
  modalType: () => Template.instance().modalState.get('type'),
  modalClass: () => 'main-modal-' + Template.instance().modalState.get('type')
})

// Step 1(set password)

Template.modal_new_password_pass.onCreated(() => Session.set('passwordType', 'password'))

Template.modal_new_password_pass.onRendered(() => modalShowContent())

Template.modal_new_password_pass.helpers({
  passwordType: () => Session.get('passwordType')
})

Template.modal_new_password_pass.events({
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  },
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    if ($('input[name=password]').val().length < 2) {
      $('input[name=password]').addClass('error')
    } else {
      $modal.addClass('waiting')
      // #just for test. need to apply the right method
      Meteor.setTimeout(() => {
        modalChangeContent(instance.view.parentView.parentView, 'new_password_words')
      }, 1000)
      // /just for test. need to apply the right method
    }
  }
})

// Step 2(12 words)

Template.modal_new_password_words.onRendered(() => {
  $modal.removeClass('waiting')
  modalShowContent()
})

Template.modal_new_password_words.events({
  'submit form.main-modal-form' (event, instance) {
    event.preventDefault()

    if ($('input[name=words]').val().length < 2) {
      $('input[name=words]').addClass('error')
    } else {
      $modal.addClass('waiting')
      // #just for test. need to apply the right method
      Meteor.setTimeout(() => {
        modalChangeContent(instance.view.parentView.parentView, 'new_password_complete')
      }, 1000)
      // /just for test. need to apply the right method
    }
  }
})

// Step 3(complete)

Template.modal_new_password_complete.onRendered(() => modalShowContent())
