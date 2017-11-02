import './mainModal.html'

Template.mainModal.onCreated(function () {
  // Set template
  Session.set('contentTemplate', this.data.contentTemplate)
  Session.set('wrapperSize', this.data.wrapperSize)
  // Set options in a reactive var
  this.options = new ReactiveVar()
  this.options.set(this.data)
})

Template.mainModal.helpers({
  contentTemplate: () => Session.get('contentTemplate'),
  wrapperSize: () => Session.get('wrapperSize'),
  options: function () {
    return Template.instance().options.get()
  }
})
