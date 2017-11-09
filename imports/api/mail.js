if (Meteor.isServer) {
  Meteor.methods({
    sendEmail (to, from, subject, text) {
      console.log('to', to)
      console.log('from', from)
      // Make sure that all arguments are strings.
      check([to, from, subject, text], [String])
      // Let other method calls from the same client start running, without
      // waiting for the email sending to complete.
      this.unblock()
      Email.send({ to, from, subject, text })
      return 'sent'
    }
  })
}
