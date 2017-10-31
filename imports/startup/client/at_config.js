// import { getKeystore } from '/imports/lib/ethereum/wallet.js'
// import { showSeed } from '/imports/ui/components/modals/showSeed.js'
import { AccountsTemplates } from 'meteor/useraccounts:core'
import { showModal, hideModal } from '/imports/lib/utils.js'

const mySubmitFunc = function (error, state) {
  if (error) {
    // NB: do _not_ throw error, it will break the accounts workflow
    console.log(error)
  }
  if (state === 'signUp') {
    // we have succesfully signed up
    // we should have an anonymous keystore - we want to re-encode thsi with the password of the new user
    console.log('SIGNUP')
    // TODO:there is a modal still open at this point, but this is not expected. Which one?
    hideModal()
    showModal('showSeed')
  }
}

const myPreSignupFunc = function (password) {
  console.log('preSignUpHook')
  Session.set('signup', true)
  Session.set('user-password', password)
}

AccountsTemplates.avoidRedirect = true

// Options for accounts
// https://github.com/meteor-useraccounts/core/blob/master/Guide.md#configuration-api
AccountsTemplates.configure({
  // Behavior
  confirmPassword: false,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: true,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,

  // Appearance
  showAddRemoveServices: false,
  showForgotPasswordLink: false,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,

  // Client-side Validation
  continuousValidation: false,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,

  // Privacy Policy and Terms of Use
  // privacyUrl: 'privacy',
  // termsUrl: 'terms-of-use',

  // Redirects
  // homeRoutePath: '/account',
  redirectTimeout: 4000,

  // Hookups
  // onLogoutHook: myLogoutFunc,
  onSubmitHook: mySubmitFunc,
  preSignUpHook: myPreSignupFunc,
  // postSignUpHook: myPostSubmitFunc,

  // Texts
  texts: {
    button: {
      signUp: 'Sign up'
    },
    // socialSignUp: "Register...",
    socialIcons: {
      'meteor-developer': 'fa fa-rocket'
    },
    title: {
      forgotPwd: 'Recover Your Password',
      signUp: 'Sign Up'
    }
  }
})

function addNameFieldToRegistrationForm () {
  const email = AccountsTemplates.removeField('email')
  const pwd = AccountsTemplates.removeField('password')

  AccountsTemplates.addField(
    {
      _id: 'name',
      displayName: 'Your name',
      type: 'text',
      // placeholder: {
      //     signUp: "At least six characters"
      // },
      required: true,
      minLength: 4
      // re: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
      // errStr: 'At least 1 digit, 1 lowercase and 1 uppercase',
    }
  )

  AccountsTemplates.addField(email)
  AccountsTemplates.addField(pwd)
}

addNameFieldToRegistrationForm()

// AccountsTemplates.configureRoute('signIn', redirect="/account");
// AccountsTemplates.configureRoute('enrollAccount');
