import { createKeystore, saveKeystore } from '/imports/lib/ethereum/wallet.js'
import { showSeed } from '/imports/ui/components/modals/showSeed.js'
import { AccountsTemplates } from 'meteor/useraccounts:core'
const mySubmitFunc = function (error, state) {
  if (error) {
    // NB: do _not_ throw error, it will break the accounts workflow
    console.log(error)
  }
  if (state === 'signUp') {
    if (Session.get('tempSeed')) {
      Session.set('wallet-state', 'generating')
      // if signup is successful, save the temporaries variables
      saveKeystore(
        Session.get('tempSeed'),
        Session.get('tempKeystore'),
        Session.get('tempAddress')
      )
      Session.set('tempSeed', null)
      Session.set('tempKeystore', null)
      Session.set('tempAddress', null)
      Session.set('wallet-state', '')
    }
    showSeed('show')
  }
}

const myPreSignupFunc = function (password) {
  // create a new wallet during signup
  Session.set('wallet-state', 'generating')
  createKeystore(password, undefined, function (err) {
    if (err) {
      throw err
    }
    Session.set('wallet-state', '')
  })
}

AccountsTemplates.avoidRedirect = true

// Options for accounts
// https://github.com/meteor-useraccounts/core/blob/master/Guide.md#configuration-api
AccountsTemplates.configure({
  // Behavior
  confirmPassword: true,
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
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,

  // Privacy Policy and Terms of Use
  privacyUrl: 'privacy',
  termsUrl: 'terms-of-use',

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
      signUp: 'Create your account'
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
