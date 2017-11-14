import MobileDetect from 'mobile-detect'

function Sniffer (...opts) {
  this.classes = ''
  this.debug = (opts[0].debug)
  this._mobileSniffer = new MobileDetect(window.navigator.userAgent)
}

Sniffer.prototype.log = function (...args) {
  if (this.debug) {
    console.log(args)
  }
}

Sniffer.prototype.getClasses = function () {
  this.classes = ''

  this.classes += (this.isMobile()) ? 'mobile ' : ''
  this.classes += (this.isPhone()) ? 'phone ' : ''
  this.classes += (this.isTablet()) ? 'tablet ' : ''
  this.log('classes', this.classes)

  return this.classes
}

Sniffer.prototype.mobile = function () {
  this.log('mobile', this._mobileSniffer.mobile())
  return this._mobileSniffer.mobile()
}

Sniffer.prototype.isMobile = function () {
  this.log('isMobile', !!(this._mobileSniffer.mobile()))
  return !!(this._mobileSniffer.mobile())
}

Sniffer.prototype.phone = function () {
  this.log('phone', this._mobileSniffer.phone())
  return this._mobileSniffer.phone()
}

Sniffer.prototype.isPhone = function () {
  this.log('isPhone', !!(this._mobileSniffer.phone()))
  return !!(this._mobileSniffer.phone())
}

Sniffer.prototype.tablet = function () {
  this.log('tablet', this._mobileSniffer.tablet())
  return this._mobileSniffer.tablet()
}

Sniffer.prototype.isTablet = function () {
  this.log('isTablet', !!(this._mobileSniffer.tablet()))
  return !!(this._mobileSniffer.tablet())
}

Sniffer.prototype.userAgent = function () {
  this.log('userAgent', this._mobileSniffer.userAgent())
  return this._mobileSniffer.userAgent()
}

Sniffer.prototype.os = function () {
  this.log('os', this._mobileSniffer.os())
  return this._mobileSniffer.os()
}

Sniffer.prototype.is = function (string) {
  this.log('is', this._mobileSniffer.is(string))
  return this._mobileSniffer.is(string)
}

Sniffer.prototype.version = function (string) {
  this.log('version', this._mobileSniffer.version(string))
  return this._mobileSniffer.version(string)
}

Sniffer.prototype.versionStr = function (string) {
  this.log('versionStr', this._mobileSniffer.versionStr(string))
  return this._mobileSniffer.versionStr(string)
}

Sniffer.prototype.match = function (string) {
  this.log('match', this._mobileSniffer.match(string))
  return this._mobileSniffer.match(string)
}

export {Sniffer}
