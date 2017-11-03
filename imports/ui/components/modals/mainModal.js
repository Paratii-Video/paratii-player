import './mainModal.html'

Template.mainModal.onCreated(function () {
  // Set template
  Session.set('contentTemplate', this.data.contentTemplate)
  Session.set('wrapperClass', this.data.wrapperClass)
  // Set options in a reactive var
  this.options = new ReactiveVar()
  this.options.set(this.data)
  console.log(this.data)
})

Template.mainModal.helpers({
  contentTemplate: () => Session.get('contentTemplate'),
  wrapperClass: () => Session.get('wrapperClass'),
  options: function () {
    return Template.instance().options.get()
  }
})
