import './signIn.html'

let $email
let $password

var emailValidation = function (address) {
  return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(address)
}

Template.modal_sign_in.onRendered(function (event, instance) {
  $email = $('[name=email]')
  $password = $('[name=password]')
})

Template.modal_sign_in.events({
  'submit form.main-modal-form' (event) {
    event.preventDefault()
    let email = $email.val()
    let password = $password.val()

    $email.removeClass('error')
    $password.removeClass('error')

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
          Modal.hide('modal_sign_in')
        }
      })
    }
  }
})

Template.modal_sign_in.events({
  'click .signup' (event) {
    Modal.hide('modal_sign_in', function () {
      Modal.show('modal_sign_up')
    })
  }
})
